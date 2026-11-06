use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::RwLock;

/// Built-in Anti-DPI engine for bypassing TSPU (ТСПУ) censorship in Russia.
/// Implements Zapret-style TLS ClientHello record splitting (split-pos=2)
/// combined with DNS-over-HTTPS (DoH) via Cloudflare & Google.
pub struct AntiDpiEngine {
    proxy_addr: SocketAddr,
}

impl AntiDpiEngine {
    pub async fn start() -> Result<Arc<Self>, Box<dyn std::error::Error + Send + Sync>> {
        let listener = TcpListener::bind("127.0.0.1:0").await?;
        let proxy_addr = listener.local_addr()?;
        println!("═══════════════════════════════════════════════════════════");
        println!("🛡️  BUILT-IN ANTI-DPI ENGINE (ZAPRET MODE) ACTIVE");
        println!("    Local forwarder listening at: http://{}", proxy_addr);
        println!("    TSPU bypass: TLS ClientHello Record Splitting (split=2)");
        println!("    Encrypted DNS: Cloudflare 1.1.1.1 & Google 8.8.8.8 DoH");
        println!("═══════════════════════════════════════════════════════════");

        let doh_cache = Arc::new(RwLock::new(HashMap::new()));
        let cache_clone = doh_cache.clone();

        tokio::spawn(async move {
            loop {
                match listener.accept().await {
                    Ok((socket, _)) => {
                        let c = cache_clone.clone();
                        tokio::spawn(async move {
                            let _ = handle_client(socket, c).await;
                        });
                    }
                    Err(e) => {
                        eprintln!("⚠️ Anti-DPI listener warning: {}", e);
                        tokio::time::sleep(Duration::from_millis(50)).await;
                    }
                }
            }
        });

        Ok(Arc::new(Self { proxy_addr }))
    }

    pub fn proxy_url(&self) -> String {
        format!("http://{}", self.proxy_addr)
    }
}

async fn handle_client(
    mut client: TcpStream,
    cache: Arc<RwLock<HashMap<String, String>>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let mut header_buf = [0u8; 4096];
    let n = client.read(&mut header_buf).await?;
    if n == 0 {
        return Ok(());
    }

    let req_str = String::from_utf8_lossy(&header_buf[..n]);
    let first_line = req_str.lines().next().unwrap_or("");
    if !first_line.starts_with("CONNECT ") {
        // Only HTTP CONNECT tunneling is handled
        return Ok(());
    }

    // Format: CONNECT domain.com:443 HTTP/1.1
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 {
        return Ok(());
    }

    let target = parts[1];
    let (host, port_str) = target.split_once(':').unwrap_or((target, "443"));
    let port: u16 = port_str.parse().unwrap_or(443);

    // Resolve domain using DNS-over-HTTPS (DoH) to bypass Russian ISP DNS blocks
    let ip = match resolve_doh_cached(host, &cache).await {
        Some(ip) => ip,
        None => host.to_string(),
    };

    let target_addr = format!("{}:{}", ip, port);
    let mut remote = match TcpStream::connect(&target_addr).await {
        Ok(s) => s,
        Err(_) => {
            // Fallback to direct host connect
            TcpStream::connect(target).await?
        }
    };

    let _ = remote.set_nodelay(true);
    let _ = client.set_nodelay(true);

    // Acknowledge the HTTP tunnel connection
    client.write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n").await?;
    client.flush().await?;

    // Read initial TLS ClientHello
    let mut ch_buf = [0u8; 16384];
    let ch_len = client.read(&mut ch_buf).await?;

    if ch_len > 5 && ch_buf[0] == 0x16 && ch_buf[1] == 0x03 {
        // Zapret / ByeDPI technique: TLS ClientHello Splitting (split-pos=2)
        // 1. Send first 2 bytes (0x16, 0x03) in the first TCP segment
        remote.write_all(&ch_buf[..2]).await?;
        remote.flush().await?;

        // 2. Short 5ms delay forces TCP PSH and prevents coalescing
        tokio::time::sleep(Duration::from_millis(5)).await;

        // 3. Send the remainder of ClientHello
        remote.write_all(&ch_buf[2..ch_len]).await?;
        remote.flush().await?;
    } else if ch_len > 0 {
        remote.write_all(&ch_buf[..ch_len]).await?;
        remote.flush().await?;
    }

    // Tunnel data bidirectionally at full speed
    let _ = tokio::io::copy_bidirectional(&mut client, &mut remote).await;
    Ok(())
}

async fn resolve_doh_cached(
    domain: &str,
    cache: &Arc<RwLock<HashMap<String, String>>>,
) -> Option<String> {
    // Check if domain is already an IP address
    if domain.parse::<std::net::IpAddr>().is_ok() {
        return Some(domain.to_string());
    }

    {
        let r = cache.read().await;
        if let Some(ip) = r.get(domain) {
            return Some(ip.clone());
        }
    }

    let doh_endpoints = [
        format!("https://1.1.1.1/dns-query?name={}&type=A", domain),
        format!("https://8.8.8.8/dns-query?name={}&type=A", domain),
        format!("https://1.0.0.1/dns-query?name={}&type=A", domain),
    ];

    let http_client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .ok()?;

    for endpoint in doh_endpoints {
        if let Ok(resp) = http_client
            .get(&endpoint)
            .header("accept", "application/dns-json")
            .send()
            .await
        {
            if let Ok(val) = resp.json::<serde_json::Value>().await {
                if let Some(answers) = val.get("Answer").and_then(|a| a.as_array()) {
                    for ans in answers {
                        if ans.get("type").and_then(|t| t.as_u64()) == Some(1) {
                            if let Some(ip_str) = ans.get("data").and_then(|d| d.as_str()) {
                                let ip = ip_str.to_string();
                                let mut w = cache.write().await;
                                w.insert(domain.to_string(), ip.clone());
                                return Some(ip);
                            }
                        }
                    }
                }
            }
        }
    }

    None
}
