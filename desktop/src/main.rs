mod discord_rpc;
mod launcher;
mod models;
mod soundcloud;

use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
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
    start_time: std::time::Instant,
}

#[derive(serde::Deserialize)]
struct SearchParams {
    q: Option<String>,
    limit: Option<usize>,
    offset: Option<usize>,
    filter: Option<String>,
    cat: Option<String>,
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
        .route("/api/system/metrics", get(api_system_metrics))
        .route("/api/window/close", post(api_window_close))
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
        .route("/api/me/albums", get(api_me_albums))
        .route("/api/me/followings", get(api_me_followings))
        .route("/api/me/stream", get(api_me_stream))
        .route("/api/me/history", get(api_me_history))
        .route("/api/home/feed", get(api_home_feed))
        .route("/api/home/mixes", get(api_home_mixes))
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
        // Profile & User Tracks API
        .route("/api/me/profile", get(api_me_profile))
        .route("/api/me/profile/update", post(api_me_profile_update))
        .route("/api/me/avatar", get(api_me_avatar))
        .route("/api/me/tracks", get(api_me_tracks))
        .route("/api/me/tracks/upload", post(api_me_tracks_upload))
        .route("/api/me/tracks/{id}", delete(api_me_tracks_delete))
        .route("/api/me/tracks/{id}", patch(api_me_tracks_update))
        .route("/api/local-audio/{id}", get(api_local_audio))
        .route("/api/local-artwork/{id}", get(api_local_artwork))
        // Themes API
        .route("/api/themes", get(api_themes))
        .route("/api/themes/save", post(api_themes_save))
        .route("/api/themes/open-folder", post(api_themes_open_folder))
        // Add-ons API
        .route("/api/addons", get(api_addons))
        .route("/api/addons/toggle", post(api_addons_toggle))
        .route("/api/addons/open-folder", post(api_addons_open_folder))
        .route("/api/addons/install-url", post(api_addons_install_url))
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
        let sc_client = Arc::new(SoundCloudClient::new(None));

        // Initialize cross-platform Discord Rich Presence (Linux & Windows)
        let discord_manager = discord_rpc::DiscordRpcManager::new();

        // Proactively refresh client_id in background
        let sc_clone = sc_client.clone();
        tokio::spawn(async move {
            println!("Discovering active SoundCloud client_id...");
            match sc_clone.refresh_client_id().await {
                Ok(id) => println!("Active SoundCloud client_id verified: {}", id),
                Err(e) => eprintln!("Could not auto-refresh client_id, using cached default: {}", e),
            }
        });

        let state = AppState {
            sc: sc_client,
            discord: discord_manager,
            start_time: std::time::Instant::now(),
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

        println!("App server listening at: {}", app_url);

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
        println!("[INFO] Running in headless server mode (--server-only / --no-window). Press Ctrl+C to stop.");
        rt.block_on(async {
            tokio::signal::ctrl_c().await.ok();
            println!("\nShutting down server...");
            let _ = shutdown_tx.send(());
            let _ = server_handle.await;
        });
    } else if force_browser {
        println!("Running with external browser window (--browser).");
        let mut child = launcher::launch_desktop_window(&app_url);
        rt.block_on(async {
            tokio::select! {
                _ = tokio::signal::ctrl_c() => {
                    println!("\nReceived shutdown signal (Ctrl+C). Exiting...");
                }
                _ = async {
                    if let Some(ref mut c) = child {
                        let _ = c.wait();
                        println!("Browser window was closed by user.");
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
                eprintln!("Failed to initialize native window ({}). Falling back to browser / background mode...", e);
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

    println!("SoundCloud Ultimate shut down cleanly.");
}

// --- API Handlers ---

async fn api_status(State(state): State<AppState>) -> impl IntoResponse {
    let id = state.sc.get_client_id().await;
    let auth = state.sc.get_auth_status().await;
    Json(serde_json::json!({
        "status": "ok",
        "client_id": id,
        "version": "2.0.0-beta.1",
        "engine": "Rust + Bento AMOLED Glass",
        "auth": auth
    }))
}

async fn api_system_metrics(State(state): State<AppState>) -> impl IntoResponse {
    let uptime_secs = state.start_time.elapsed().as_secs();
    let mut mem_rss_mb = 0.0;
    #[cfg(target_os = "linux")]
    {
        if let Ok(content) = std::fs::read_to_string("/proc/self/statm") {
            let parts: Vec<&str> = content.split_whitespace().collect();
            if parts.len() >= 2
                && let Ok(pages) = parts[1].parse::<u64>() {
                    let page_size = 4096;
                    mem_rss_mb = ((pages * page_size) as f64) / (1024.0 * 1024.0);
                }
        }
    }
    let client_id_cached = state.sc.get_client_id().await;
    let auth_status = state.sc.get_auth_status().await;
    let logged_in = auth_status.authenticated;

    Json(serde_json::json!({
        "status": "ok",
        "uptime_secs": uptime_secs,
        "rss_memory_mb": (mem_rss_mb * 10.0).round() / 10.0,
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "authenticated": logged_in,
        "client_id_active": !client_id_cached.is_empty()
    }))
}

async fn api_window_close() -> StatusCode {
    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_millis(150));
        std::process::exit(0);
    });
    StatusCode::OK
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

async fn api_me_albums(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_my_playlists_and_albums().await {
        Ok((_, albums)) => (StatusCode::OK, Json(serde_json::json!({ "albums": albums }))).into_response(),
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_me_followings(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_my_followings(50).await {
        Ok(artists) => (StatusCode::OK, Json(serde_json::json!({ "artists": artists }))).into_response(),
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_home_feed(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_home_feed().await {
        Ok(feed) => (StatusCode::OK, Json(feed)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
    }
}

async fn api_home_mixes(State(state): State<AppState>) -> impl IntoResponse {
    match state.sc.get_home_mixes().await {
        Ok(mixes) => (StatusCode::OK, Json(serde_json::json!({ "mixes": mixes }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e }))).into_response(),
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
    let filter = params.filter.or(params.cat);

    match state.sc.search(&q, limit, offset, filter.as_deref()).await {
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

#[derive(serde::Deserialize)]
struct UpdateProfilePayload {
    username: Option<String>,
    description: Option<String>,
    city: Option<String>,
    avatar_url: Option<String>,
    avatar_base64: Option<String>,
}

#[derive(serde::Deserialize)]
struct UploadTrackPayload {
    title: String,
    artist: Option<String>,
    genre: Option<String>,
    tags: Option<String>,
    description: Option<String>,
    privacy: Option<String>,
    duration_ms: Option<u64>,
    audio_filename: Option<String>,
    audio_base64: String,
    artwork_base64: Option<String>,
}

#[derive(serde::Deserialize)]
struct UpdateTrackPayload {
    title: String,
    genre: Option<String>,
    tags: Option<String>,
    description: Option<String>,
}

#[derive(serde::Deserialize)]
struct SaveThemePayload {
    id: String,
    name: String,
    author: Option<String>,
    variables: serde_json::Value,
}

#[derive(serde::Deserialize)]
struct ToggleAddonPayload {
    id: String,
    enabled: bool,
}

#[derive(serde::Deserialize)]
struct InstallAddonPayload {
    url: String,
}

fn decode_base64_data(input: &str) -> Result<Vec<u8>, String> {
    use base64::Engine;
    let clean = if let Some(idx) = input.find(";base64,") {
        &input[idx + 8..]
    } else {
        input.trim()
    };
    base64::engine::general_purpose::STANDARD
        .decode(clean)
        .map_err(|e| format!("Base64 decode error: {}", e))
}

fn open_in_file_manager(path: &std::path::Path) {
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("explorer").arg(path).spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open").arg(path).spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open").arg(path).spawn();
    }
}

async fn api_me_profile(State(state): State<AppState>) -> impl IntoResponse {
    let cfg = sc_core::AppConfig::load();
    if let Some(user) = cfg.current_user {
        Json(serde_json::json!({ "authenticated": true, "user": user })).into_response()
    } else {
        let auth = state.sc.get_auth_status().await;
        Json(serde_json::json!(auth)).into_response()
    }
}

async fn api_me_profile_update(
    State(state): State<AppState>,
    Json(payload): Json<UpdateProfilePayload>,
) -> impl IntoResponse {
    let mut cfg = sc_core::AppConfig::load();
    let mut avatar_url = payload.avatar_url;

    if let Some(ref b64) = payload.avatar_base64
        && let Ok(bytes) = decode_base64_data(b64) {
            let avatar_path = sc_core::AppConfig::app_dir().join("avatar.png");
            if std::fs::write(&avatar_path, bytes).is_ok() {
                avatar_url = Some("/api/me/avatar".to_string());
            }
        }

    let updated_user = cfg.update_profile(
        payload.username.clone(),
        payload.description.clone(),
        payload.city.clone(),
        avatar_url,
    );

    if let Some(token) = state.sc.get_oauth_token().await {
        let client_id = state.sc.get_client_id().await;
        let client = state.sc.raw_client();
        let body = serde_json::json!({
            "user": {
                "username": payload.username,
                "description": payload.description,
                "city": payload.city
            }
        });
        let _ = client
            .put(format!("https://api-v2.soundcloud.com/me?client_id={}", client_id))
            .header("Authorization", format!("OAuth {}", token))
            .json(&body)
            .send()
            .await;
    }

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "user": updated_user
        })),
    )
        .into_response()
}

async fn api_me_avatar() -> Response {
    let avatar_png = sc_core::AppConfig::app_dir().join("avatar.png");
    let avatar_jpg = sc_core::AppConfig::app_dir().join("avatar.jpg");
    let path = if avatar_png.exists() {
        Some(avatar_png)
    } else if avatar_jpg.exists() {
        Some(avatar_jpg)
    } else {
        None
    };

    if let Some(p) = path && let Ok(bytes) = std::fs::read(&p) {
        let mime = mime_guess::from_path(&p).first_or_octet_stream();
        let mut headers = HeaderMap::new();
        headers.insert(header::CONTENT_TYPE, mime.as_ref().parse().unwrap());
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-cache"));
        return (StatusCode::OK, headers, bytes).into_response();
    }

    (StatusCode::NOT_FOUND, "No custom avatar").into_response()
}

async fn api_me_tracks(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let cfg = sc_core::AppConfig::load();
    let mut tracks: Vec<models::TrackItem> = cfg
        .my_uploaded_tracks
        .iter()
        .map(|t| {
            let item = t.to_track_item();
            models::TrackItem {
                id: item.id,
                title: item.title,
                artist: item.artist,
                artist_id: item.artist_id,
                artist_avatar: item.artist_avatar,
                artwork_url: item.artwork_url,
                duration_ms: item.duration_ms,
                playback_count: item.playback_count,
                likes_count: item.likes_count,
                waveform_url: item.waveform_url,
                stream_url: item.stream_url,
                genre: item.genre,
                permalink_url: item.permalink_url,
                liked: item.liked,
            }
        })
        .collect();

    if let Ok(me) = state.sc.get_me().await
        && let Ok(profile) = state.sc.get_artist_profile(me.id).await {
            tracks.extend(profile.tracks);
        }

    Json(serde_json::json!({ "tracks": tracks }))
}

async fn api_me_tracks_upload(
    State(_state): State<AppState>,
    Json(payload): Json<UploadTrackPayload>,
) -> impl IntoResponse {
    let track_id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    let track_dir = sc_core::AppConfig::uploads_dir().join(track_id.to_string());
    if let Err(e) = std::fs::create_dir_all(&track_dir) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": format!("Failed to create track folder: {}", e) })),
        )
            .into_response();
    }

    let audio_bytes = match decode_base64_data(&payload.audio_base64) {
        Ok(b) => b,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({ "error": format!("Invalid audio data: {}", e) })),
            )
                .into_response();
        }
    };

    let ext = payload
        .audio_filename
        .as_ref()
        .and_then(|f| std::path::Path::new(f).extension().and_then(|s| s.to_str()))
        .unwrap_or("mp3");

    let audio_filename = format!("audio.{}", ext);
    if let Err(e) = std::fs::write(track_dir.join(&audio_filename), audio_bytes) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": format!("Failed to save audio: {}", e) })),
        )
            .into_response();
    }

    let mut artwork_file = None;
    if let Some(ref art_b64) = payload.artwork_base64
        && let Ok(art_bytes) = decode_base64_data(art_b64) {
            let _ = std::fs::write(track_dir.join("artwork.jpg"), art_bytes);
            artwork_file = Some("artwork.jpg".to_string());
        }

    let mut cfg = sc_core::AppConfig::load();
    let artist_name = payload
        .artist
        .or_else(|| cfg.current_user.as_ref().map(|u| u.username.clone()))
        .unwrap_or_else(|| "You".to_string());

    let uploaded = sc_core::models::UploadedTrack {
        id: track_id,
        title: payload.title,
        artist: artist_name,
        genre: payload.genre,
        tags: payload.tags,
        description: payload.description,
        privacy: payload.privacy.unwrap_or_else(|| "public".to_string()),
        duration_ms: payload.duration_ms.unwrap_or(180000),
        audio_file: audio_filename,
        artwork_file,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };

    let track_item = uploaded.to_track_item();
    cfg.add_uploaded_track(uploaded);

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "track": track_item
        })),
    )
        .into_response()
}

async fn api_me_tracks_delete(
    Path(id): Path<u64>,
) -> impl IntoResponse {
    let mut cfg = sc_core::AppConfig::load();
    cfg.delete_uploaded_track(id);
    let track_dir = sc_core::AppConfig::uploads_dir().join(id.to_string());
    let _ = std::fs::remove_dir_all(&track_dir);
    Json(serde_json::json!({ "success": true }))
}

async fn api_me_tracks_update(
    Path(id): Path<u64>,
    Json(payload): Json<UpdateTrackPayload>,
) -> impl IntoResponse {
    let mut cfg = sc_core::AppConfig::load();
    cfg.update_uploaded_track(id, payload.title, payload.genre, payload.tags, payload.description);
    Json(serde_json::json!({ "success": true }))
}

async fn api_local_audio(
    Path(id): Path<u64>,
    headers: HeaderMap,
) -> Response {
    let track_dir = sc_core::AppConfig::uploads_dir().join(id.to_string());
    if !track_dir.exists() {
        return (StatusCode::NOT_FOUND, "Track not found").into_response();
    }

    let mut audio_path = None;
    if let Ok(entries) = std::fs::read_dir(&track_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if let Some(stem) = p.file_stem() && stem == "audio" {
                audio_path = Some(p);
                break;
            }
        }
    }

    let audio_path = match audio_path {
        Some(p) => p,
        None => return (StatusCode::NOT_FOUND, "Audio file not found").into_response(),
    };

    let file_bytes = match std::fs::read(&audio_path) {
        Ok(b) => b,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to read file: {}", e)).into_response(),
    };

    let total_len = file_bytes.len();
    let mime = mime_guess::from_path(&audio_path).first_or_octet_stream();

    if let Some(range_header) = headers.get(header::RANGE).and_then(|h| h.to_str().ok())
        && let Some(range_spec) = range_header.strip_prefix("bytes=") {
            let parts: Vec<&str> = range_spec.split('-').collect();
            let start = parts[0].parse::<usize>().unwrap_or(0);
            let end = if parts.len() > 1 && !parts[1].is_empty() {
                parts[1].parse::<usize>().unwrap_or(total_len.saturating_sub(1)).min(total_len.saturating_sub(1))
            } else {
                total_len.saturating_sub(1)
            };

            if start <= end && start < total_len {
                let chunk = &file_bytes[start..=end];
                let content_range = format!("bytes {}-{}/{}", start, end, total_len);
                let mut resp_headers = HeaderMap::new();
                resp_headers.insert(header::CONTENT_TYPE, mime.as_ref().parse().unwrap());
                resp_headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
                resp_headers.insert(header::CONTENT_RANGE, content_range.parse().unwrap());
                resp_headers.insert(header::CONTENT_LENGTH, chunk.len().into());

                return (StatusCode::PARTIAL_CONTENT, resp_headers, chunk.to_vec()).into_response();
            }
        }

    let mut resp_headers = HeaderMap::new();
    resp_headers.insert(header::CONTENT_TYPE, mime.as_ref().parse().unwrap());
    resp_headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    resp_headers.insert(header::CONTENT_LENGTH, total_len.into());
    (StatusCode::OK, resp_headers, file_bytes).into_response()
}

async fn api_local_artwork(Path(id): Path<u64>) -> Response {
    let track_dir = sc_core::AppConfig::uploads_dir().join(id.to_string());
    let mut art_path = None;
    if let Ok(entries) = std::fs::read_dir(&track_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if let Some(stem) = p.file_stem() && stem == "artwork" {
                art_path = Some(p);
                break;
            }
        }
    }

    if let Some(path) = art_path && let Ok(bytes) = std::fs::read(&path) {
        let mime = mime_guess::from_path(&path).first_or_octet_stream();
        let mut headers = HeaderMap::new();
        headers.insert(header::CONTENT_TYPE, mime.as_ref().parse().unwrap());
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("public, max-age=86400"));
        return (StatusCode::OK, headers, bytes).into_response();
    }

    if let Some(content) = Assets::get("assets/default_artwork.png") {
        let mut headers = HeaderMap::new();
        headers.insert(header::CONTENT_TYPE, HeaderValue::from_static("image/png"));
        return (StatusCode::OK, headers, content.data).into_response();
    }

    (StatusCode::NOT_FOUND, "Artwork not found").into_response()
}

async fn api_themes() -> impl IntoResponse {
    let themes_dir = sc_core::AppConfig::themes_dir();
    let _ = std::fs::create_dir_all(&themes_dir);

    let default_theme = serde_json::json!({
        "id": "quiet-dark-amoled",
        "name": "Quiet Dark AMOLED",
        "author": "SoundCloud Ultimate",
        "variables": {
            "bg_window": "#09090B",
            "bg_surface": "#121215",
            "bg_elevated": "#18181B",
            "accent": "#FF5500",
            "accent_hover": "#FF6B1A",
            "text_primary": "#FAFAFA",
            "text_muted": "#A1A1AA",
            "border_subtle": "rgba(255, 255, 255, 0.08)",
            "player_bg": "#0D0D10"
        }
    });

    let mut themes = vec![default_theme];

    if let Ok(entries) = std::fs::read_dir(&themes_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                let theme_file = p.join("theme.json");
                if theme_file.exists()
                    && let Ok(content) = std::fs::read_to_string(&theme_file)
                    && let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
                        themes.push(val);
                    }
            }
        }
    }

    Json(serde_json::json!({ "themes": themes }))
}

async fn api_themes_save(
    Json(payload): Json<SaveThemePayload>,
) -> impl IntoResponse {
    let theme_dir = sc_core::AppConfig::themes_dir().join(&payload.id);
    if let Err(e) = std::fs::create_dir_all(&theme_dir) {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response();
    }

    let val = serde_json::json!({
        "id": payload.id,
        "name": payload.name,
        "author": payload.author.unwrap_or_else(|| "User".to_string()),
        "variables": payload.variables
    });

    let _ = std::fs::write(theme_dir.join("theme.json"), serde_json::to_string_pretty(&val).unwrap_or_default());
    (StatusCode::OK, Json(serde_json::json!({ "success": true }))).into_response()
}

async fn api_themes_open_folder() -> impl IntoResponse {
    let dir = sc_core::AppConfig::themes_dir();
    let _ = std::fs::create_dir_all(&dir);
    open_in_file_manager(&dir);
    Json(serde_json::json!({ "success": true, "path": dir.to_string_lossy() }))
}

async fn api_addons() -> impl IntoResponse {
    let addons_dir = sc_core::AppConfig::addons_dir();
    let _ = std::fs::create_dir_all(&addons_dir);

    let mut addons = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&addons_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                let manifest_file = p.join("manifest.json");
                if manifest_file.exists()
                    && let Ok(content) = std::fs::read_to_string(&manifest_file)
                    && let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
                        addons.push(val);
                    }
            }
        }
    }

    Json(serde_json::json!({ "addons": addons }))
}

async fn api_addons_toggle(
    Json(payload): Json<ToggleAddonPayload>,
) -> impl IntoResponse {
    let manifest_file = sc_core::AppConfig::addons_dir().join(&payload.id).join("manifest.json");
    if manifest_file.exists()
        && let Ok(content) = std::fs::read_to_string(&manifest_file)
        && let Ok(mut val) = serde_json::from_str::<serde_json::Value>(&content) {
            val["enabled"] = serde_json::Value::Bool(payload.enabled);
            let _ = std::fs::write(&manifest_file, serde_json::to_string_pretty(&val).unwrap_or_default());
            return (StatusCode::OK, Json(serde_json::json!({ "success": true }))).into_response();
        }
    (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Addon not found" }))).into_response()
}

async fn api_addons_open_folder() -> impl IntoResponse {
    let dir = sc_core::AppConfig::addons_dir();
    let _ = std::fs::create_dir_all(&dir);
    open_in_file_manager(&dir);
    Json(serde_json::json!({ "success": true, "path": dir.to_string_lossy() }))
}

async fn api_addons_install_url(
    Json(payload): Json<InstallAddonPayload>,
) -> impl IntoResponse {
    let url = payload.url.trim();
    if url.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "URL cannot be empty" }))).into_response();
    }
    let addon_name = url.rsplit('/').next().unwrap_or("addon").replace(".git", "");
    let addon_dir = sc_core::AppConfig::addons_dir().join(&addon_name);
    let _ = std::fs::create_dir_all(&addon_dir);
    let manifest = serde_json::json!({
        "id": addon_name,
        "name": addon_name,
        "version": "1.0.0",
        "description": format!("Installed from {}", url),
        "entry": "index.js",
        "enabled": true
    });
    let _ = std::fs::write(addon_dir.join("manifest.json"), serde_json::to_string_pretty(&manifest).unwrap_or_default());
    let _ = std::fs::write(addon_dir.join("index.js"), "// Addon entrypoint\nconsole.log('Add-on loaded');\n");

    (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Add-on installed successfully" }))).into_response()
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
