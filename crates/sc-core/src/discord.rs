use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::{mpsc, RwLock};

pub const DEFAULT_DISCORD_CLIENT_ID: &str = "802958833214423081";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordActivityPayload {
    pub title: String,
    pub artist: String,
    pub duration_secs: Option<u64>,
    pub current_time_secs: Option<u64>,
    pub is_playing: bool,
    pub permalink_url: Option<String>,
    pub artwork_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordStatusResponse {
    pub enabled: bool,
    pub connected: bool,
    pub username: Option<String>,
    pub current_track: Option<String>,
}

#[derive(Debug)]
pub enum DiscordCommand {
    UpdateActivity(DiscordActivityPayload),
    ClearActivity,
    SetEnabled(bool),
}

pub enum IpcStream {
    #[cfg(unix)]
    Unix(tokio::net::UnixStream),
    #[cfg(windows)]
    Windows(tokio::net::windows::named_pipe::NamedPipeClient),
}

impl IpcStream {
    pub async fn write_packet(&mut self, opcode: u32, payload: &[u8]) -> std::io::Result<()> {
        let mut header = [0u8; 8];
        header[0..4].copy_from_slice(&opcode.to_le_bytes());
        header[4..8].copy_from_slice(&(payload.len() as u32).to_le_bytes());

        match self {
            #[cfg(unix)]
            IpcStream::Unix(s) => {
                s.write_all(&header).await?;
                s.write_all(payload).await?;
                s.flush().await?;
            }
            #[cfg(windows)]
            IpcStream::Windows(s) => {
                s.write_all(&header).await?;
                s.write_all(payload).await?;
                s.flush().await?;
            }
        }
        Ok(())
    }

    pub async fn read_packet(&mut self) -> std::io::Result<(u32, Vec<u8>)> {
        let mut header = [0u8; 8];
        match self {
            #[cfg(unix)]
            IpcStream::Unix(s) => {
                s.read_exact(&mut header).await?;
            }
            #[cfg(windows)]
            IpcStream::Windows(s) => {
                s.read_exact(&mut header).await?;
            }
        }

        let opcode = u32::from_le_bytes([header[0], header[1], header[2], header[3]]);
        let length = u32::from_le_bytes([header[4], header[5], header[6], header[7]]) as usize;

        let mut payload = vec![0u8; length];
        match self {
            #[cfg(unix)]
            IpcStream::Unix(s) => {
                s.read_exact(&mut payload).await?;
            }
            #[cfg(windows)]
            IpcStream::Windows(s) => {
                s.read_exact(&mut payload).await?;
            }
        }

        Ok((opcode, payload))
    }
}

pub struct DiscordRpcManager {
    sender: mpsc::UnboundedSender<DiscordCommand>,
    status: Arc<RwLock<DiscordStatusResponse>>,
}

impl DiscordRpcManager {
    pub fn new() -> Arc<Self> {
        let (tx, rx) = mpsc::unbounded_channel();
        let status = Arc::new(RwLock::new(DiscordStatusResponse {
            enabled: true,
            connected: false,
            username: None,
            current_track: None,
        }));

        let manager = Arc::new(Self {
            sender: tx,
            status: status.clone(),
        });

        // Spawn background worker
        tokio::spawn(discord_rpc_worker(rx, status));

        manager
    }

    pub async fn update_activity(&self, activity: DiscordActivityPayload) {
        self.status.write().await.current_track = Some(format!("{} - {}", activity.artist, activity.title));
        let _ = self.sender.send(DiscordCommand::UpdateActivity(activity));
    }

    pub async fn clear_activity(&self) {
        self.status.write().await.current_track = None;
        let _ = self.sender.send(DiscordCommand::ClearActivity);
    }

    pub async fn set_enabled(&self, enabled: bool) {
        self.status.write().await.enabled = enabled;
        let _ = self.sender.send(DiscordCommand::SetEnabled(enabled));
    }

    pub async fn get_status(&self) -> DiscordStatusResponse {
        self.status.read().await.clone()
    }
}

async fn connect_discord_ipc() -> std::io::Result<IpcStream> {
    #[cfg(unix)]
    {
        let mut candidates = Vec::new();

        if let Ok(runtime_dir) = std::env::var("XDG_RUNTIME_DIR") {
            for i in 0..10 {
                candidates.push(PathBuf::from(&runtime_dir).join(format!("discord-ipc-{}", i)));
                candidates.push(
                    PathBuf::from(&runtime_dir)
                        .join("app/com.discordapp.Discord")
                        .join(format!("discord-ipc-{}", i)),
                );
            }
        }

        if let Ok(temp) = std::env::var("TMPDIR") {
            for i in 0..10 {
                candidates.push(PathBuf::from(&temp).join(format!("discord-ipc-{}", i)));
            }
        }

        for i in 0..10 {
            candidates.push(PathBuf::from("/tmp").join(format!("discord-ipc-{}", i)));
        }

        for path in candidates {
            if path.exists()
                && let Ok(stream) = tokio::net::UnixStream::connect(path).await {
                    return Ok(IpcStream::Unix(stream));
                }
        }

        Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Discord IPC socket not found",
        ))
    }

    #[cfg(windows)]
    {
        use tokio::net::windows::named_pipe::ClientOptions;
        for i in 0..10 {
            let pipe_name = format!(r"\\.\pipe\discord-ipc-{}", i);
            if let Ok(client) = ClientOptions::new().open(&pipe_name) {
                return Ok(IpcStream::Windows(client));
            }
        }
        Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Discord IPC pipe not found",
        ))
    }
}

async fn discord_rpc_worker(
    mut receiver: mpsc::UnboundedReceiver<DiscordCommand>,
    status: Arc<RwLock<DiscordStatusResponse>>,
) {
    let mut ipc_stream: Option<IpcStream> = None;
    let mut nonce: u64 = 0;
    let mut last_activity: Option<DiscordActivityPayload> = None;
    let mut enabled = true;

    loop {
        if enabled && ipc_stream.is_none()
            && let Ok(mut stream) = connect_discord_ipc().await {
                // Send Handshake
                let handshake = serde_json::json!({
                    "v": 1,
                    "client_id": DEFAULT_DISCORD_CLIENT_ID
                });
                let payload = handshake.to_string().into_bytes();
                if stream.write_packet(0, &payload).await.is_ok() {
                    // Try reading handshake response
                    if let Ok((_op, resp_bytes)) = stream.read_packet().await
                        && let Ok(val) = serde_json::from_slice::<serde_json::Value>(&resp_bytes) {
                            let mut s = status.write().await;
                            s.connected = true;
                            if let Some(user) = val.get("data").and_then(|d| d.get("user")) {
                                s.username = user.get("username").and_then(|u| u.as_str()).map(|s| s.to_string());
                            }
                        }
                    ipc_stream = Some(stream);

                    // Re-send last activity if present
                    if let (Some(act), Some(s)) = (&last_activity, &mut ipc_stream) {
                        nonce += 1;
                        let _ = send_activity_packet(s, act, nonce).await;
                    }
                }
            }

        tokio::select! {
            cmd = receiver.recv() => {
                match cmd {
                    Some(DiscordCommand::SetEnabled(new_enabled)) => {
                        enabled = new_enabled;
                        let mut s = status.write().await;
                        s.enabled = enabled;
                        if !enabled {
                            if let Some(ref mut stream) = ipc_stream {
                                nonce += 1;
                                let _ = send_clear_packet(stream, nonce).await;
                            }
                            let mut s = status.write().await;
                            s.connected = false;
                            s.current_track = None;
                        }
                    }
                    Some(DiscordCommand::UpdateActivity(activity)) => {
                        status.write().await.current_track = Some(format!("{} - {}", activity.artist, activity.title));
                        last_activity = Some(activity.clone());

                        if enabled
                            && let Some(ref mut stream) = ipc_stream {
                                nonce += 1;
                                if !send_activity_packet(stream, &activity, nonce).await {
                                    ipc_stream = None;
                                    let mut s = status.write().await;
                                    s.connected = false;
                                }
                            }
                    }
                    Some(DiscordCommand::ClearActivity) => {
                        last_activity = None;
                        status.write().await.current_track = None;

                        if let Some(ref mut stream) = ipc_stream {
                            nonce += 1;
                            if !send_clear_packet(stream, nonce).await {
                                ipc_stream = None;
                                let mut s = status.write().await;
                                s.connected = false;
                            }
                        }
                    }
                    None => break,
                }
            }
        }
    }
}

async fn send_activity_packet(stream: &mut IpcStream, act: &DiscordActivityPayload, nonce: u64) -> bool {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let timestamps = if act.is_playing {
        let current = act.current_time_secs.unwrap_or(0);
        let duration = act.duration_secs.unwrap_or(0);

        let start_time = now.saturating_sub(current);
        let end_time = if duration > current {
            Some(now + (duration - current))
        } else {
            None
        };

        if let Some(end) = end_time {
            Some(serde_json::json!({
                "start": start_time,
                "end": end
            }))
        } else {
            Some(serde_json::json!({
                "start": start_time
            }))
        }
    } else {
        None
    };

    let artwork = act
        .artwork_url
        .as_deref()
        .filter(|url| !url.is_empty() && url.starts_with("http"))
        .unwrap_or("https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14bdb.ico");

    let state_text = if act.is_playing {
        format!("by {}", act.artist)
    } else {
        format!("by {} (⏸️ Paused)", act.artist)
    };

    let mut buttons = Vec::new();
    if let Some(ref url) = act.permalink_url
        && url.starts_with("http") {
            buttons.push(serde_json::json!({
                "label": "Listen on SoundCloud",
                "url": url
            }));
        }

    let activity_json = serde_json::json!({
        "type": 2, // 2 = Listening to
        "details": act.title,
        "state": state_text,
        "timestamps": timestamps,
        "assets": {
            "large_image": artwork,
            "large_text": act.title,
            "small_image": if act.is_playing { "https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14bdb.ico" } else { "https://cdn-icons-png.flaticon.com/512/16/16427.png" },
            "small_text": if act.is_playing { "SoundCloud Ultimate" } else { "Paused" }
        },
        "buttons": if buttons.is_empty() { serde_json::Value::Null } else { serde_json::json!(buttons) }
    });

    let payload = serde_json::json!({
        "cmd": "SET_ACTIVITY",
        "args": {
            "pid": std::process::id(),
            "activity": activity_json
        },
        "nonce": format!("sc-rpc-{}", nonce)
    });

    let payload_bytes = payload.to_string().into_bytes();
    if stream.write_packet(1, &payload_bytes).await.is_err() {
        return false;
    }

    true
}

async fn send_clear_packet(stream: &mut IpcStream, nonce: u64) -> bool {
    let payload = serde_json::json!({
        "cmd": "SET_ACTIVITY",
        "args": {
            "pid": std::process::id(),
            "activity": serde_json::Value::Null
        },
        "nonce": format!("sc-rpc-{}", nonce)
    });

    let payload_bytes = payload.to_string().into_bytes();
    stream.write_packet(1, &payload_bytes).await.is_ok()
}
