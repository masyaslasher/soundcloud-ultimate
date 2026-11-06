mod antidpi;
mod discord_rpc;
mod launcher;
mod models;
mod soundcloud;

use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Json, Router,
};
use mime_guess::from_path;
use models::PostCommentPayload;
use rust_embed::RustEmbed;
use soundcloud::SoundCloudClient;
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::CorsLayer;

#[derive(RustEmbed)]
#[folder = "frontend/"]
struct Assets;

#[derive(Clone)]
struct AppState {
    sc: Arc<SoundCloudClient>,
    discord: Arc<discord_rpc::DiscordRpcManager>,
}

#[derive(serde::Deserialize)]
struct SearchParams {
    q: Option<String>,
    limit: Option<usize>,
    offset: Option<usize>,
}

#[derive(serde::Deserialize)]
struct TrendingParams {
    genre: Option<String>,
    limit: Option<usize>,
}

#[derive(serde::Deserialize)]
struct StreamParams {
    id: u64,
}

#[derive(serde::Deserialize)]
struct LoginPayload {
    token: String,
}

#[derive(serde::Deserialize)]
struct LikesParams {
    limit: Option<usize>,
    offset: Option<usize>,
}

fn create_router(state: AppState) -> Router {
    Router::new()
        // Core API
        .route("/api/status", get(api_status))
        .route("/api/search", get(api_search))
        .route("/api/trending", get(api_trending))
        .route("/api/stream", get(api_stream))
        .route("/api/track/{id}", get(api_track))
        .route("/api/download", get(api_download))
        // Discord Rich Presence API (Linux & Windows)
        .route("/api/discord/activity", post(api_discord_activity))
        .route("/api/discord/clear", post(api_discord_clear))
        .route("/api/discord/status", get(api_discord_status))
        .route("/api/discord/toggle", post(api_discord_toggle))
        // Media Proxy API (Bypasses Russian TSPU blocks for HLS and progressive audio)
        .route("/api/media/stream", get(api_media_stream))
        .route("/api/media/chunk", get(api_media_chunk))
        .route("/api/media/image", get(api_media_image))
        // Auth API
        .route("/api/auth/status", get(api_auth_status))
        .route("/api/auth/login", post(api_auth_login))
        .route("/api/auth/logout", post(api_auth_logout))
        .route("/api/auth/import-browser", post(api_auth_import_browser))
        // User Library API
        .route("/api/me/likes", get(api_me_likes))
        .route("/api/me/playlists", get(api_me_playlists))
        .route("/api/me/stream", get(api_me_stream))
        .route("/api/me/history", get(api_me_history))
        .route("/api/tracks/{id}/like", post(api_track_like))
        .route("/api/tracks/{id}/like", delete(api_track_unlike))
        // Artist & Profile API
        .route("/api/artists/{id}", get(api_artist_profile))
        .route("/api/artists/{id}/follow", post(api_artist_follow))
        .route("/api/artists/{id}/follow", delete(api_artist_unfollow))
        // Comments & Related Radio API
        .route("/api/tracks/{id}/comments", get(api_track_comments))
        .route("/api/tracks/{id}/comments", post(api_post_comment))
        .route("/api/tracks/{id}/related", get(api_track_related))
        .route("/api/playlists/{id}", get(api_playlist_details))
        // Frontend Static Assets
        .fallback(static_handler)
        .layer(CorsLayer::permissive())
        .with_state(state)
}

fn main() {
    println!("═══════════════════════════════════════════════════════════");
    println!("     SOUNDCLOUD ULTIMATE — NATIVE DESKTOP STANDALONE       ");
    println!("═══════════════════════════════════════════════════════════");

    let no_window = std::env::args().any(|a| a == "--server-only" || a == "--no-window");
    let force_browser = std::env::args().any(|a| a == "--browser");

    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to initialize Tokio runtime");

    let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();

    let (app_url, server_handle) = rt.block_on(async {
        // Initialize built-in Anti-DPI (Zapret-style TLS Record Splitting + DoH)
        let antidpi_engine = match antidpi::AntiDpiEngine::start().await {
            Ok(engine) => Some(engine),
            Err(e) => {
                eprintln!("⚠️ Anti-DPI engine could not start: {}", e);
                None
            }
        };

        let proxy_url = antidpi_engine.as_ref().map(|e| e.proxy_url());
        let sc_client = Arc::new(SoundCloudClient::new(proxy_url));

        // Initialize cross-platform Discord Rich Presence (Linux & Windows)
        let discord_manager = discord_rpc::DiscordRpcManager::new();

        // Proactively refresh client_id in background
        let sc_clone = sc_client.clone();
        tokio::spawn(async move {
            println!("🔍 Discovering active SoundCloud client_id...");
            match sc_clone.refresh_client_id().await {
                Ok(id) => println!("✨ Active SoundCloud client_id verified: {}", id),
                Err(e) => eprintln!("⚠️ Could not auto-refresh client_id, using cached default: {}", e),
            }
        });

        let state = AppState {
            sc: sc_client,
            discord: discord_manager,
        };

        let app = create_router(state);

        let addr = SocketAddr::from(([127, 0, 0, 1], 4545));
        let listener = match tokio::net::TcpListener::bind(addr).await {
            Ok(l) => l,
            Err(_) => {
                let fallback_addr = SocketAddr::from(([127, 0, 0, 1], 0));
                tokio::net::TcpListener::bind(fallback_addr).await.expect("Failed to bind to local port")
            }
        };

        let local_addr = listener.local_addr().unwrap();
        let app_url = format!("http://{}", local_addr);

        println!("🌐 App server listening at: {}", app_url);

        let handle = tokio::spawn(async move {
            let server = axum::serve(listener, app);
            let graceful = server.with_graceful_shutdown(async move {
                let _ = shutdown_rx.await;
            });
            let _ = graceful.await;
        });

        (app_url, handle)
    });

    if no_window {
        println!("ℹ️ Running in headless server mode (--server-only / --no-window). Press Ctrl+C to stop.");
        rt.block_on(async {
            tokio::signal::ctrl_c().await.ok();
            println!("\n🛑 Shutting down server...");
            let _ = shutdown_tx.send(());
            let _ = server_handle.await;
        });
    } else if force_browser {
        println!("🌐 Running with external browser window (--browser).");
        let mut child = launcher::launch_desktop_window(&app_url);
        rt.block_on(async {
            tokio::select! {
                _ = tokio::signal::ctrl_c() => {
                    println!("\n🛑 Received shutdown signal (Ctrl+C). Exiting...");
                }
                _ = async {
                    if let Some(ref mut c) = child {
                        let _ = c.wait();
                        println!("🚪 Browser window was closed by user.");
                    } else {
                        std::future::pending::<()>().await;
                    }
                } => {}
            }
            let _ = shutdown_tx.send(());
            let _ = server_handle.await;
        });
    } else {
        match launcher::run_native_window(&app_url) {
            Ok(()) => {
                let _ = shutdown_tx.send(());
                let _ = rt.block_on(server_handle);
            }
            Err(e) => {
                eprintln!("⚠️ Failed to initialize native window ({}). Falling back to browser / background mode...", e);
                let mut child = launcher::launch_desktop_window(&app_url);
                rt.block_on(async {
                    tokio::select! {
                        _ = tokio::signal::ctrl_c() => {}
                        _ = async {
                            if let Some(ref mut c) = child {
                                let _ = c.wait();
                            } else {
                                std::future::pending::<()>().await;
                            }
                        } => {}
                    }
                    let _ = shutdown_tx.send(());
                    let _ = server_handle.await;
                });
            }
        }
    }

    println!("👋 SoundCloud Ultimate shut down cleanly.");
}

// --- API Handlers ---

async fn api_status(State(state): State<AppState>) -> impl IntoResponse {
    let id = state.sc.get_client_id().await;
    let auth = state.sc.get_auth_status().await;
    Json(serde_json::json!({
        "status": "ok",
        "client_id": id,
        "version": "1.3.0",
        "engine": "Rust + Bento AMOLED Glass",
        "antidpi": "active (Zapret TLS Split + Cloudflare DoH)",
        "auth": auth
    }))
}

async fn api_auth_status(State(state): State<AppState>) -> impl IntoResponse {
    let auth = state.sc.get_auth_status().await;
    Json(auth)
}

async fn api_auth_import_browser(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.auto_import_from_browser().await {
        Ok(profile) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "authenticated": true,
                "user": profile
            })),
        )
            .into_response(),
        Err(e) => (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({
                "authenticated": false,
                "error": e
            })),
        )
            .into_response(),
    }
}

async fn api_auth_login(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> impl IntoResponse {
    let token = payload.token.trim().to_string();
    state.sc.set_oauth_token(Some(token)).await;

    match state.sc.get_me().await {
        Ok(profile) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "authenticated": true,
                "user": profile
            })),
        )
            .into_response(),
        Err(e) => {
            state.sc.set_oauth_token(None).await;
            (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({
                    "authenticated": false,
                    "error": format!("Sign-in failed: {}", e)
                })),
            )
                .into_response()
        }
    }
}

async fn api_auth_logout(State(state): State<AppState>) -> impl IntoResponse {
    state.sc.set_oauth_token(None).await;
    Json(serde_json::json!({ "authenticated": false, "message": "Logged out" }))
}

async fn api_me_likes(
    State(state): State<AppState>,
    Query(params): Query<LikesParams>,
) -> impl IntoResponse {
    let limit = params.limit.unwrap_or(50);
    let offset = params.offset.unwrap_or(0);

    match state.sc.get_my_likes(limit, offset).await {
        Ok(tracks) => (StatusCode::OK, Json(serde_json::json!({ "tracks": tracks }))).into_response(),
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_me_playlists(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_my_playlists(50).await {
        Ok(playlists) => (StatusCode::OK, Json(serde_json::json!({ "playlists": playlists }))).into_response(),
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_me_stream(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_my_stream(50).await {
        Ok(tracks) => (StatusCode::OK, Json(serde_json::json!({ "tracks": tracks }))).into_response(),
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_me_history(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_my_history(30).await {
        Ok(tracks) => (StatusCode::OK, Json(serde_json::json!({ "tracks": tracks }))).into_response(),
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_track_like(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.toggle_like(id, true).await {
        Ok(ok) => (StatusCode::OK, Json(serde_json::json!({ "liked": ok }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_track_unlike(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.toggle_like(id, false).await {
        Ok(ok) => (StatusCode::OK, Json(serde_json::json!({ "liked": !ok }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_artist_profile(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.get_artist_profile(id).await {
        Ok(profile) => (StatusCode::OK, Json(profile)).into_response(),
        Err(e) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_artist_follow(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.toggle_follow(id, true).await {
        Ok(ok) => (StatusCode::OK, Json(serde_json::json!({ "following": ok }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_artist_unfollow(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.toggle_follow(id, false).await {
        Ok(ok) => (StatusCode::OK, Json(serde_json::json!({ "following": !ok }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_track_comments(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.get_track_comments(id, 40).await {
        Ok(comments) => (StatusCode::OK, Json(serde_json::json!({ "comments": comments }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_post_comment(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    Json(payload): Json<PostCommentPayload>,
) -> impl IntoResponse {
    match state.sc.post_comment(id, payload).await {
        Ok(comment) => (StatusCode::OK, Json(comment)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_track_related(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.get_related_tracks(id, 24).await {
        Ok(tracks) => (StatusCode::OK, Json(serde_json::json!({ "tracks": tracks }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_playlist_details(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.get_playlist(id).await {
        Ok(playlist) => (StatusCode::OK, Json(playlist)).into_response(),
        Err(e) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_search(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> impl IntoResponse {
    let q = params.q.unwrap_or_else(|| "popular".to_string());
    let limit = params.limit.unwrap_or(24);
    let offset = params.offset.unwrap_or(0);

    match state.sc.search(&q, limit, offset).await {
        Ok(res) => (StatusCode::OK, Json(serde_json::json!(res))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_trending(
    State(state): State<AppState>,
    Query(params): Query<TrendingParams>,
) -> impl IntoResponse {
    let genre = params.genre.as_deref();
    let limit = params.limit.unwrap_or(24);

    match state.sc.get_trending(genre, limit).await {
        Ok(tracks) => (StatusCode::OK, Json(serde_json::json!({ "tracks": tracks }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_stream(
    State(state): State<AppState>,
    Query(params): Query<StreamParams>,
) -> impl IntoResponse {
    match state.sc.resolve_track_stream(params.id).await {
        Ok(stream) => {
            let enc = hex_encode(&stream.stream_url);
            let proxied_url = format!("/api/media/stream?u={}&protocol={}", enc, stream.protocol);
            (
                StatusCode::OK,
                Json(serde_json::json!({
                    "stream_url": proxied_url,
                    "original_url": stream.stream_url,
                    "protocol": stream.protocol,
                    "mime_type": stream.mime_type
                })),
            )
                .into_response()
        }
        Err(e) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

#[derive(serde::Deserialize)]
struct MediaStreamQuery {
    u: String,
    protocol: Option<String>,
}

async fn api_media_stream(
    State(state): State<AppState>,
    in_headers: HeaderMap,
    Query(params): Query<MediaStreamQuery>,
) -> Response {
    let url_bytes = match hex_decode(&params.u) {
        Some(b) => b,
        None => return (StatusCode::BAD_REQUEST, "Invalid URL encoding").into_response(),
    };
    let url = match String::from_utf8(url_bytes) {
        Ok(s) => s,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid UTF-8 URL").into_response(),
    };

    let client = state.sc.raw_client();
    let resp = match client.get(&url).send().await {
        Ok(r) => r,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Stream fetch failed: {}", e)).into_response(),
    };

    let content_type = resp
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let is_hls = params.protocol.as_deref() == Some("hls")
        || url.contains(".m3u8")
        || content_type.contains("mpegurl");

    if is_hls {
        let text = match resp.text().await {
            Ok(t) => t,
            Err(e) => return (StatusCode::BAD_GATEWAY, format!("Read m3u8 failed: {}", e)).into_response(),
        };

        let base_url = match reqwest::Url::parse(&url) {
            Ok(u) => u,
            Err(_) => return (StatusCode::BAD_REQUEST, "Invalid target URL").into_response(),
        };

        let mut rewritten_lines = Vec::new();
        for line in text.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                rewritten_lines.push(line.to_string());
                continue;
            }
            if trimmed.starts_with('#') {
                if trimmed.contains("URI=\"") {
                    let mut new_line = trimmed.to_string();
                    if let Some(start_idx) = new_line.find("URI=\"") {
                        let after_quote = &new_line[start_idx + 5..];
                        if let Some(end_idx) = after_quote.find('"') {
                            let uri_str = &after_quote[..end_idx];
                            let full_url = if uri_str.starts_with("http://") || uri_str.starts_with("https://") {
                                uri_str.to_string()
                            } else if let Ok(joined) = base_url.join(uri_str) {
                                joined.to_string()
                            } else {
                                uri_str.to_string()
                            };
                            let enc = hex_encode(&full_url);
                            let proxied = format!("/api/media/chunk?u={}", enc);
                            new_line = format!("{}URI=\"{}\"{}", &new_line[..start_idx], proxied, &after_quote[end_idx + 1..]);
                        }
                    }
                    rewritten_lines.push(new_line);
                } else {
                    rewritten_lines.push(line.to_string());
                }
            } else {
                let full_url = if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
                    trimmed.to_string()
                } else if let Ok(joined) = base_url.join(trimmed) {
                    joined.to_string()
                } else {
                    trimmed.to_string()
                };

                let enc = hex_encode(&full_url);
                rewritten_lines.push(format!("/api/media/chunk?u={}", enc));
            }
        }

        let body = rewritten_lines.join("\n");
        let mut headers = HeaderMap::new();
        headers.insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("application/vnd.apple.mpegurl"),
        );
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-cache"));
        return (StatusCode::OK, headers, body).into_response();
    }

    let bytes = match resp.bytes().await {
        Ok(b) => b,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Stream read failed: {}", e)).into_response(),
    };

    if let Some(range_header) = in_headers.get(header::RANGE).and_then(|v| v.to_str().ok())
        && let Some(spec) = range_header.strip_prefix("bytes=") {
            let parts: Vec<&str> = spec.split('-').collect();
            let total_len = bytes.len();
            let start: usize = parts.first().and_then(|s| s.parse().ok()).unwrap_or(0);
            let end: usize = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(total_len.saturating_sub(1));
            let end = end.min(total_len.saturating_sub(1));

            if start <= end && start < total_len {
                let chunk = bytes.slice(start..=end);
                let mut headers = HeaderMap::new();
                headers.insert(header::CONTENT_TYPE, HeaderValue::from_static("audio/mpeg"));
                headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
                headers.insert(header::CONTENT_LENGTH, HeaderValue::from(chunk.len() as u64));
                if let Ok(cr) = HeaderValue::from_str(&format!("bytes {}-{}/{}", start, end, total_len)) {
                    headers.insert(header::CONTENT_RANGE, cr);
                }
                return (StatusCode::PARTIAL_CONTENT, headers, Body::from(chunk)).into_response();
            }
        }

    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, HeaderValue::from_static("audio/mpeg"));
    headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    headers.insert(
        header::CONTENT_LENGTH,
        HeaderValue::from(bytes.len() as u64),
    );
    (StatusCode::OK, headers, Body::from(bytes)).into_response()
}

async fn api_media_chunk(
    State(state): State<AppState>,
    Query(params): Query<MediaStreamQuery>,
) -> Response {
    let url_bytes = match hex_decode(&params.u) {
        Some(b) => b,
        None => return (StatusCode::BAD_REQUEST, "Invalid URL encoding").into_response(),
    };
    let url = match String::from_utf8(url_bytes) {
        Ok(s) => s,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid UTF-8 URL").into_response(),
    };

    let client = state.sc.raw_client();
    let resp = match client.get(&url).send().await {
        Ok(r) => r,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Chunk fetch failed: {}", e)).into_response(),
    };

    let content_type = resp
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "video/MP2T".to_string());

    let bytes = match resp.bytes().await {
        Ok(b) => b,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Chunk bytes failed: {}", e)).into_response(),
    };

    let mut headers = HeaderMap::new();
    if let Ok(hv) = HeaderValue::from_str(&content_type) {
        headers.insert(header::CONTENT_TYPE, hv);
    }
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=86400"),
    );
    (StatusCode::OK, headers, Body::from(bytes)).into_response()
}

async fn api_media_image(
    State(state): State<AppState>,
    Query(params): Query<MediaStreamQuery>,
) -> Response {
    let url_bytes = match hex_decode(&params.u) {
        Some(b) => b,
        None => return (StatusCode::BAD_REQUEST, "Invalid URL encoding").into_response(),
    };
    let url = match String::from_utf8(url_bytes) {
        Ok(s) => s,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid UTF-8 URL").into_response(),
    };

    let client = state.sc.raw_client();
    let resp = match client.get(&url).send().await {
        Ok(r) => r,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Image fetch failed: {}", e)).into_response(),
    };

    let content_type = resp
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/jpeg")
        .to_string();

    let bytes = match resp.bytes().await {
        Ok(b) => b,
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Image bytes failed: {}", e)).into_response(),
    };

    let mut headers = HeaderMap::new();
    if let Ok(hv) = HeaderValue::from_str(&content_type) {
        headers.insert(header::CONTENT_TYPE, hv);
    }
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=604800"),
    );
    (StatusCode::OK, headers, Body::from(bytes)).into_response()
}

fn hex_encode(s: &str) -> String {
    s.as_bytes().iter().map(|b| format!("{:02x}", b)).collect()
}

fn hex_decode(s: &str) -> Option<Vec<u8>> {
    if !s.len().is_multiple_of(2) {
        return None;
    }
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).ok())
        .collect()
}

fn sanitize_for_header(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '.' || c == '-' || c == '_' || c == ' ' { c } else { '_' })
        .collect()
}

fn percent_encode_filename(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => out.push(b as char),
            _ => out.push_str(&format!("%{:02X}", b)),
        }
    }
    out
}

async fn api_download(
    State(state): State<AppState>,
    Query(params): Query<StreamParams>,
) -> Response {
    match state.sc.download_track_bytes(params.id).await {
        Ok((filename, bytes)) => {
            let mut headers = HeaderMap::new();
            let safe_ascii = sanitize_for_header(&filename);
            let encoded_utf8 = percent_encode_filename(&filename);
            let disp = format!(
                "attachment; filename=\"{}\"; filename*=UTF-8''{}",
                safe_ascii, encoded_utf8
            );
            headers.insert(
                header::CONTENT_DISPOSITION,
                HeaderValue::from_str(&disp)
                    .unwrap_or_else(|_| HeaderValue::from_static("attachment; filename=\"track.mp3\"")),
            );
            headers.insert(header::CONTENT_TYPE, HeaderValue::from_static("audio/mpeg"));
            headers.insert(header::CONTENT_LENGTH, HeaderValue::from(bytes.len() as u64));
            (StatusCode::OK, headers, Body::from(bytes)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_track(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.sc.get_track_by_id(id).await {
        Ok(track) => (StatusCode::OK, Json(serde_json::json!(track))).into_response(),
        Err(e) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCORD RICH PRESENCE HANDLERS (Cross-Platform Linux & Windows)
// ═══════════════════════════════════════════════════════════════════════════

#[derive(serde::Deserialize)]
struct DiscordTogglePayload {
    enabled: bool,
}

async fn api_discord_activity(
    State(state): State<AppState>,
    Json(payload): Json<discord_rpc::DiscordActivityPayload>,
) -> impl IntoResponse {
    state.discord.update_activity(payload).await;
    (StatusCode::OK, Json(serde_json::json!({ "status": "ok" }))).into_response()
}

async fn api_discord_clear(
    State(state): State<AppState>,
) -> impl IntoResponse {
    state.discord.clear_activity().await;
    (StatusCode::OK, Json(serde_json::json!({ "status": "ok" }))).into_response()
}

async fn api_discord_status(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let status = state.discord.get_status().await;
    (StatusCode::OK, Json(status)).into_response()
}

async fn api_discord_toggle(
    State(state): State<AppState>,
    Json(payload): Json<DiscordTogglePayload>,
) -> impl IntoResponse {
    state.discord.set_enabled(payload.enabled).await;
    let status = state.discord.get_status().await;
    (StatusCode::OK, Json(status)).into_response()
}

async fn static_handler(uri: axum::http::Uri) -> Response {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
    }

    match Assets::get(&path) {
        Some(content) => {
            let mime = from_path(&path).first_or_octet_stream();
            let mut headers = HeaderMap::new();
            headers.insert(header::CONTENT_TYPE, mime.as_ref().parse().unwrap());
            headers.insert(header::CACHE_CONTROL, "no-cache".parse().unwrap());
            (StatusCode::OK, headers, content.data).into_response()
        }
        None => match Assets::get("index.html") {
            Some(content) => {
                let mut headers = HeaderMap::new();
                headers.insert(header::CONTENT_TYPE, "text/html; charset=utf-8".parse().unwrap());
                (StatusCode::OK, headers, content.data).into_response()
            }
            None => (StatusCode::NOT_FOUND, "404 Not Found").into_response(),
        },
    }
}
