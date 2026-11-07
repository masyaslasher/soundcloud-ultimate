use crate::config::AppConfig;
use crate::models::{
    AuthMethod, AuthStatus, PlaylistItem, SearchResponse, StreamResponse, TrackItem, UserProfile,
};
use regex::Regex;
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::RwLock;

pub const DEFAULT_CLIENT_ID: &str = "8UvlHph8Fhze3ZixMeSkFXj4Dwkblsjt";
const USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

#[derive(Clone)]
pub struct SoundCloudApi {
    client: reqwest::Client,
    client_id: Arc<RwLock<String>>,
    config: Arc<RwLock<AppConfig>>,
}

impl SoundCloudApi {
    pub fn new(config: AppConfig) -> Self {
        let client = reqwest::Client::builder()
            .user_agent(USER_AGENT)
            .build()
            .unwrap_or_default();

        Self {
            client,
            client_id: Arc::new(RwLock::new(DEFAULT_CLIENT_ID.to_string())),
            config: Arc::new(RwLock::new(config)),
        }
    }

    pub async fn config(&self) -> AppConfig {
        self.config.read().await.clone()
    }

    pub async fn update_config<F>(&self, update_fn: F) -> Result<AppConfig, String>
    where
        F: FnOnce(&mut AppConfig),
    {
        let mut cfg = self.config.write().await;
        update_fn(&mut cfg);
        cfg.save()?;
        Ok(cfg.clone())
    }

    pub async fn get_client_id(&self) -> String {
        self.client_id.read().await.clone()
    }

    pub async fn refresh_client_id(&self) -> Result<String, String> {
        let html = self
            .client
            .get("https://soundcloud.com")
            .send()
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        let script_re = Regex::new(r#"<script[^>]+src="(https://[^"]+assets[^"]+\.js)""#).unwrap();
        let client_id_re = Regex::new(r#"client_id[:=]"([a-zA-Z0-9]{32})""#).unwrap();

        let mut script_urls: Vec<String> = script_re
            .captures_iter(&html)
            .filter_map(|cap| cap.get(1).map(|m| m.as_str().to_string()))
            .collect();

        script_urls.reverse();

        for url in script_urls.iter().take(10) {
            if let Ok(resp) = self.client.get(url).send().await
                && let Ok(js) = resp.text().await
                && let Some(cap) = client_id_re.captures(&js)
                && let Some(id_match) = cap.get(1)
            {
                let new_id = id_match.as_str().to_string();
                let mut write_guard = self.client_id.write().await;
                *write_guard = new_id.clone();
                return Ok(new_id);
            }
        }

        let id = self.client_id.read().await.clone();
        Ok(id)
    }

    fn apply_auth(&self, builder: reqwest::RequestBuilder, token: Option<&str>) -> reqwest::RequestBuilder {
        if let Some(t) = token {
            let auth_val = if t.starts_with("OAuth ") {
                t.to_string()
            } else {
                format!("OAuth {}", t)
            };
            builder.header("Authorization", auth_val)
        } else {
            builder
        }
    }

    pub async fn get_auth_status(&self) -> AuthStatus {
        let cfg = self.config.read().await;
        if let Some(ref token) = cfg.oauth_token
            && let Ok(user) = self.fetch_me(token).await {
                return AuthStatus {
                    authenticated: true,
                    user: Some(user),
                    method: AuthMethod::OAuth,
                };
            }

        if let Some(ref user) = cfg.current_user {
            return AuthStatus {
                authenticated: true,
                user: Some(user.clone()),
                method: if cfg.oauth_token.is_some() {
                    AuthMethod::OAuth
                } else {
                    AuthMethod::PublicProfile
                },
            };
        }

        AuthStatus {
            authenticated: false,
            user: None,
            method: AuthMethod::None,
        }
    }

    pub async fn login_with_token(&self, token: String) -> Result<UserProfile, String> {
        let clean_token = token.trim().strip_prefix("OAuth ").unwrap_or(token.trim()).to_string();
        let user = self.fetch_me(&clean_token).await?;

        let mut cfg = self.config.write().await;
        cfg.oauth_token = Some(clean_token);
        cfg.current_user = Some(user.clone());
        let _ = cfg.save();

        Ok(user)
    }

    pub async fn login_with_public_profile(&self, input: &str) -> Result<UserProfile, String> {
        let client_id = self.get_client_id().await;
        let username = input
            .trim()
            .trim_end_matches('/')
            .rsplit('/')
            .next()
            .unwrap_or(input.trim());

        let target_url = if input.contains("soundcloud.com") {
            input.trim().to_string()
        } else {
            format!("https://soundcloud.com/{}", username)
        };

        let resolve_url = format!(
            "https://api-v2.soundcloud.com/resolve?url={}&client_id={}",
            urlencoding(&target_url),
            client_id
        );

        let resp = self.client.get(&resolve_url).send().await.map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err(format!("Profile not found or resolution failed: HTTP {}", resp.status()));
        }

        let val: Value = resp.json().await.map_err(|e| e.to_string())?;
        let id = val.get("id").and_then(|v| v.as_u64()).ok_or_else(|| "Invalid resolved user".to_string())?;
        let user = parse_user_profile(&val, id);

        let mut cfg = self.config.write().await;
        cfg.public_profile_url = Some(target_url);
        cfg.current_user = Some(user.clone());
        let _ = cfg.save();

        Ok(user)
    }

    pub async fn logout(&self) -> Result<(), String> {
        let mut cfg = self.config.write().await;
        cfg.oauth_token = None;
        cfg.public_profile_url = None;
        cfg.current_user = None;
        cfg.save()
    }

    async fn fetch_me(&self, token: &str) -> Result<UserProfile, String> {
        let client_id = self.get_client_id().await;
        let url = format!("https://api-v2.soundcloud.com/me?client_id={}", client_id);

        let req = self.client.get(&url);
        let req = self.apply_auth(req, Some(token));

        let resp = req.send().await.map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err(format!("Invalid OAuth token: HTTP {}", resp.status()));
        }
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let id = val.get("id").and_then(|v| v.as_u64()).ok_or_else(|| "Invalid user id".to_string())?;
        Ok(parse_user_profile(&val, id))
    }

    pub async fn get_likes(&self, limit: usize) -> Result<Vec<TrackItem>, String> {
        let cfg = self.config.read().await;
        let user = cfg.current_user.clone();
        let token = cfg.oauth_token.clone();
        drop(cfg);

        let user = match user {
            Some(u) => u,
            None => {
                // If not logged in, return local likes from config
                let cfg = self.config.read().await;
                return Ok(cfg.liked_tracks.clone());
            }
        };

        let client_id = self.get_client_id().await;
        let url = format!(
            "https://api-v2.soundcloud.com/users/{}/track_likes?client_id={}&limit={}",
            user.id, client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, token.as_deref());

        let resp = req.send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let mut tracks = Vec::new();
        if let Some(col) = val.get("collection").and_then(|c| c.as_array()) {
            for item in col {
                let track_val = item.get("track").unwrap_or(item);
                if let Some(mut t) = parse_single_track(track_val) {
                    t.liked = Some(true);
                    tracks.push(t);
                }
            }
        }

        if !tracks.is_empty() {
            let mut cfg = self.config.write().await;
            cfg.liked_tracks = tracks.clone();
            let _ = cfg.save();
        }

        Ok(tracks)
    }

    pub async fn get_user_playlists(&self, limit: usize) -> Result<Vec<PlaylistItem>, String> {
        let cfg = self.config.read().await;
        let user = cfg.current_user.clone();
        let token = cfg.oauth_token.clone();
        drop(cfg);

        let user = match user {
            Some(u) => u,
            None => return Ok(Vec::new()),
        };

        let client_id = self.get_client_id().await;
        let url = format!(
            "https://api-v2.soundcloud.com/users/{}/playlists?client_id={}&limit={}",
            user.id, client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, token.as_deref());

        let resp = req.send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let mut playlists = Vec::new();
        if let Some(col) = val.get("collection").and_then(|c| c.as_array()).or_else(|| val.as_array()) {
            for item in col {
                if let Some(p) = parse_single_playlist(item) {
                    playlists.push(p);
                }
            }
        }

        Ok(playlists)
    }

    pub async fn search(&self, query: &str, limit: usize, offset: usize, filter: Option<&str>) -> Result<SearchResponse, String> {
        let client_id = self.get_client_id().await;
        let token = self.config.read().await.oauth_token.clone();
        let cat = filter.unwrap_or("all").to_lowercase();

        let mut tracks = Vec::new();
        let mut playlists = Vec::new();
        let mut users = Vec::new();
        let mut next_href = None;

        // Tracks
        if cat == "all" || cat == "tracks" {
            let track_limit = if cat == "tracks" { limit.max(30) } else { limit };
            let tracks_url = format!(
                "https://api-v2.soundcloud.com/search/tracks?q={}&client_id={}&limit={}&offset={}",
                urlencoding(query),
                client_id,
                track_limit,
                offset
            );

            let req = self.client.get(&tracks_url);
            let req = self.apply_auth(req, token.as_deref());
            if let Ok(resp) = req.send().await
                && let Ok(val) = resp.json::<Value>().await
            {
                tracks = parse_track_collection(&val);
                next_href = val.get("next_href").and_then(|v| v.as_str()).map(|s| s.to_string());
            }
        }

        // Playlists
        if cat == "all" || cat == "playlists" || cat == "albums" {
            let pl_limit = if cat == "playlists" || cat == "albums" { limit.max(24) } else { 12 };
            let pl_url = format!(
                "https://api-v2.soundcloud.com/search/playlists?q={}&client_id={}&limit={}",
                urlencoding(query),
                client_id,
                pl_limit
            );
            if let Ok(pl_resp) = self.client.get(&pl_url).send().await
                && let Ok(pl_val) = pl_resp.json::<Value>().await
                && let Some(col) = pl_val.get("collection").and_then(|c| c.as_array())
            {
                for item in col {
                    if let Some(p) = parse_single_playlist(item) {
                        playlists.push(p);
                    }
                }
            }
        }

        // Users / Artists
        if cat == "all" || cat == "artists" || cat == "users" {
            let u_limit = if cat == "artists" || cat == "users" { limit.max(24) } else { 8 };
            let u_url = format!(
                "https://api-v2.soundcloud.com/search/users?q={}&client_id={}&limit={}",
                urlencoding(query),
                client_id,
                u_limit
            );
            if let Ok(u_resp) = self.client.get(&u_url).send().await
                && let Ok(u_val) = u_resp.json::<Value>().await
                && let Some(col) = u_val.get("collection").and_then(|c| c.as_array())
            {
                for item in col {
                    if let Some(id) = item.get("id").and_then(|v| v.as_u64()) {
                        users.push(parse_user_profile(item, id));
                    }
                }
            }
        }

        Ok(SearchResponse { tracks, playlists, users, next_href })
    }

    pub async fn get_trending(&self, genre: Option<&str>, limit: usize) -> Result<Vec<TrackItem>, String> {
        let client_id = self.get_client_id().await;
        let genre_param = match genre {
            Some(g) if !g.is_empty() => format!("soundcloud:genres:{}", g),
            _ => "soundcloud:genres:all-music".to_string(),
        };

        let url = format!(
            "https://api-v2.soundcloud.com/charts?kind=top&genre={}&client_id={}&limit={}",
            urlencoding(&genre_param),
            client_id,
            limit
        );

        let resp = self.client.get(&url).send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let mut tracks = Vec::new();
        if let Some(collection) = val.get("collection").and_then(|c| c.as_array()) {
            for item in collection {
                if let Some(track_val) = item.get("track")
                    && let Some(t) = parse_single_track(track_val)
                {
                    tracks.push(t);
                }
            }
        }

        if tracks.is_empty() {
            let fallback = self.search("electronic", limit, 0, None).await?;
            return Ok(fallback.tracks);
        }

        Ok(tracks)
    }

    pub async fn get_track_by_id(&self, track_id: u64) -> Result<TrackItem, String> {
        let client_id = self.get_client_id().await;
        let url = format!(
            "https://api-v2.soundcloud.com/tracks/{}?client_id={}",
            track_id, client_id
        );

        let resp = self.client.get(&url).send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        parse_single_track(&val).ok_or_else(|| "Failed to parse track data".to_string())
    }

    pub async fn get_playlist_by_id(&self, playlist_id: u64) -> Result<PlaylistItem, String> {
        let client_id = self.get_client_id().await;
        let token = self.config.read().await.oauth_token.clone();
        let url = format!("https://api-v2.soundcloud.com/playlists/{}?client_id={}", playlist_id, client_id);

        let req = self.client.get(&url);
        let req = self.apply_auth(req, token.as_deref());
        let val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;

        let mut playlist = parse_single_playlist(&val).ok_or_else(|| "Failed to parse playlist".to_string())?;

        // Fill stub tracks if needed
        let missing_ids: Vec<u64> = val.get("tracks")
            .and_then(|t| t.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|item| {
                        if item.get("title").is_none() {
                            item.get("id").and_then(|id| id.as_u64())
                        } else {
                            None
                        }
                    })
                    .collect()
            })
            .unwrap_or_default();

        if !missing_ids.is_empty() {
            let batch: Vec<String> = missing_ids.iter().take(50).map(|id| id.to_string()).collect();
            let ids_str = batch.join("%2C");
            let tracks_url = format!("https://api-v2.soundcloud.com/tracks?ids={}&client_id={}", ids_str, client_id);
            let req = self.apply_auth(self.client.get(&tracks_url), token.as_deref());
            if let Ok(resp) = req.send().await
                && let Ok(full_tracks_val) = resp.json::<Value>().await
            {
                let full_tracks = parse_track_collection(&full_tracks_val);
                let mut track_map: std::collections::HashMap<u64, TrackItem> = full_tracks.into_iter().map(|t| (t.id, t)).collect();

                for t in playlist.tracks.iter_mut() {
                    if t.title == "Unknown Title"
                        && let Some(resolved) = track_map.remove(&t.id)
                    {
                        *t = resolved;
                    }
                }
            }
        }

        playlist.tracks.retain(|t| t.title != "Unknown Title");
        Ok(playlist)
    }

    pub async fn resolve_track_stream(&self, track_id: u64) -> Result<StreamResponse, String> {
        let client_id = self.get_client_id().await;
        let token = self.config.read().await.oauth_token.clone();

        let track_url = format!(
            "https://api-v2.soundcloud.com/tracks/{}?client_id={}",
            track_id, client_id
        );

        let req = self.client.get(&track_url);
        let req = self.apply_auth(req, token.as_deref());

        let resp = req.send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let transcodings = val
            .get("media")
            .and_then(|m| m.get("transcodings"))
            .and_then(|t| t.as_array())
            .ok_or_else(|| "No media transcodings found for track".to_string())?;

        let mut candidates = Vec::new();

        for t in transcodings {
            let protocol = t.get("format").and_then(|f| f.get("protocol")).and_then(|p| p.as_str()).unwrap_or("");
            let mime = t.get("format").and_then(|f| f.get("mime_type")).and_then(|m| m.as_str()).unwrap_or("");
            let url = t.get("url").and_then(|u| u.as_str()).unwrap_or("");

            if !url.is_empty() {
                candidates.push((protocol.to_string(), mime.to_string(), url.to_string()));
            }
        }

        candidates.sort_by(|a, b| {
            let rank = |proto: &str| match proto {
                "progressive" => 0,
                "hls" => 1,
                _ => 2,
            };
            rank(&a.0).cmp(&rank(&b.0))
        });

        for (protocol, mime, info_url) in candidates {
            let full_info_url = format!("{}?client_id={}", info_url, client_id);
            let mut req = self.client.get(&full_info_url);
            req = self.apply_auth(req, token.as_deref());

            if let Ok(info_resp) = req.send().await
                && let Ok(stream_val) = info_resp.json::<Value>().await
                && let Some(stream_url) = stream_val.get("url").and_then(|u| u.as_str())
            {
                return Ok(StreamResponse {
                    stream_url: stream_url.to_string(),
                    protocol,
                    mime_type: mime,
                });
            }
        }

        Err("Failed to resolve playable audio stream".to_string())
    }

    pub async fn fetch_audio_bytes(&self, track_id: u64) -> Result<Vec<u8>, String> {
        let stream = self.resolve_track_stream(track_id).await?;

        if stream.protocol == "progressive" {
            let bytes = self.client.get(&stream.stream_url).send().await
                .map_err(|e| e.to_string())?
                .bytes().await
                .map_err(|e| e.to_string())?;
            return Ok(bytes.to_vec());
        }

        // HLS audio streaming
        let resp = self.client.get(&stream.stream_url).send().await.map_err(|e| e.to_string())?;
        let playlist_text = resp.text().await.map_err(|e| e.to_string())?;

        let base_url = reqwest::Url::parse(&stream.stream_url).ok();
        let mut segment_urls = Vec::new();

        for line in playlist_text.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            let full_url = if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
                trimmed.to_string()
            } else if let Some(ref base) = base_url {
                if let Ok(joined) = base.join(trimmed) {
                    joined.to_string()
                } else {
                    trimmed.to_string()
                }
            } else {
                trimmed.to_string()
            };
            segment_urls.push(full_url);
        }

        if segment_urls.is_empty() {
            return Err("No audio segments found in HLS stream".to_string());
        }

        let mut full_audio_bytes = Vec::new();
        for seg_url in segment_urls {
            if let Ok(seg_resp) = self.client.get(&seg_url).send().await
                && let Ok(chunk_bytes) = seg_resp.bytes().await
            {
                full_audio_bytes.extend_from_slice(&chunk_bytes);
            }
        }

        if full_audio_bytes.is_empty() {
            return Err("Failed to download any audio segments".to_string());
        }

        Ok(full_audio_bytes)
    }

    pub async fn toggle_like(&self, track_id: u64, like: bool) -> Result<bool, String> {
        let token = self.config.read().await.oauth_token.clone();
        let client_id = self.get_client_id().await;

        if let Some(ref t) = token {
            let url = format!(
                "https://api-v2.soundcloud.com/likes/tracks/{}?client_id={}",
                track_id, client_id
            );
            let req = if like {
                self.client.post(&url)
            } else {
                self.client.delete(&url)
            };
            let req = self.apply_auth(req, Some(t));
            let _ = req.send().await;
        }

        Ok(true)
    }
}

fn parse_user_profile(val: &Value, id: u64) -> UserProfile {
    let username = val.get("username").and_then(|v| v.as_str()).unwrap_or("User").to_string();
    let avatar_url = val.get("avatar_url").and_then(|v| v.as_str()).map(|s| s.replace("-large.jpg", "-t500x500.jpg"));
    let permalink_url = val.get("permalink_url").and_then(|v| v.as_str()).map(|s| s.to_string());
    let followers_count = val.get("followers_count").and_then(|v| v.as_u64());
    let followings_count = val.get("followings_count").and_then(|v| v.as_u64());
    let likes_count = val.get("public_favorites_count").and_then(|v| v.as_u64())
        .or_else(|| val.get("likes_count").and_then(|v| v.as_u64()));
    let playlist_count = val.get("playlist_count").and_then(|v| v.as_u64());
    let description = val.get("description").and_then(|d| d.as_str()).map(|s| s.to_string());
    let city = val.get("city").and_then(|c| c.as_str()).map(|s| s.to_string());
    let country = val.get("country").and_then(|c| c.as_str()).map(|s| s.to_string());

    UserProfile {
        id,
        username,
        avatar_url,
        permalink_url,
        followers_count,
        followings_count,
        likes_count,
        playlist_count,
        description,
        city,
        country,
    }
}

fn parse_track_collection(val: &Value) -> Vec<TrackItem> {
    let mut tracks = Vec::new();
    if let Some(col) = val.get("collection").and_then(|c| c.as_array()) {
        for item in col {
            let track_val = item.get("track").unwrap_or(item);
            if let Some(t) = parse_single_track(track_val) {
                tracks.push(t);
            }
        }
    }
    tracks
}

pub fn parse_single_track(item: &Value) -> Option<TrackItem> {
    let id = item.get("id")?.as_u64()?;
    let title = item.get("title").and_then(|t| t.as_str()).unwrap_or("Unknown Title").to_string();

    let user = item.get("user");
    let artist_id = user.and_then(|u| u.get("id")).and_then(|i| i.as_u64());
    let artist = user.and_then(|u| u.get("username")).and_then(|a| a.as_str()).unwrap_or("Unknown Artist").to_string();
    let artist_avatar = user.and_then(|u| u.get("avatar_url")).and_then(|a| a.as_str()).map(|s| s.to_string());

    let artwork_url = item.get("artwork_url")
        .and_then(|a| a.as_str())
        .or_else(|| user.and_then(|u| u.get("avatar_url")).and_then(|a| a.as_str()))
        .map(|s| s.replace("-large.jpg", "-t500x500.jpg").replace("-large.png", "-t500x500.png"));

    let duration_ms = item.get("duration").and_then(|d| d.as_u64()).unwrap_or(0);
    let playback_count = item.get("playback_count").and_then(|p| p.as_u64());
    let likes_count = item.get("likes_count").and_then(|l| l.as_u64());
    let waveform_url = item.get("waveform_url").and_then(|w| w.as_str()).map(|s| s.to_string());
    let genre = item.get("genre").and_then(|g| g.as_str()).map(|s| s.to_string());
    let permalink_url = item.get("permalink_url").and_then(|p| p.as_str()).map(|s| s.to_string());
    let liked = item.get("user_favorite").and_then(|uf| uf.as_bool());

    Some(TrackItem {
        id,
        title,
        artist,
        artist_id,
        artist_avatar,
        artwork_url,
        duration_ms,
        playback_count,
        likes_count,
        waveform_url,
        stream_url: None,
        genre,
        permalink_url,
        liked,
    })
}

pub fn parse_single_playlist(item: &Value) -> Option<PlaylistItem> {
    let id = item.get("id")?.as_u64()?;
    let title = item.get("title").and_then(|t| t.as_str()).unwrap_or("Playlist").to_string();
    let user = item.get("user");
    let artist_id = user.and_then(|u| u.get("id")).and_then(|i| i.as_u64());
    let artist = user.and_then(|u| u.get("username")).and_then(|a| a.as_str()).unwrap_or("SoundCloud").to_string();
    let artwork_url = item.get("artwork_url").and_then(|a| a.as_str())
        .map(|s| s.replace("-large.jpg", "-t500x500.jpg").replace("-large.png", "-t500x500.png"));
    let track_count = item.get("track_count").and_then(|tc| tc.as_u64()).unwrap_or(0);
    let duration_ms = item.get("duration").and_then(|d| d.as_u64()).unwrap_or(0);
    let permalink_url = item.get("permalink_url").and_then(|p| p.as_str()).map(|s| s.to_string());

    let mut tracks = Vec::new();
    if let Some(t_array) = item.get("tracks").and_then(|t| t.as_array()) {
        for t in t_array {
            if let Some(track) = parse_single_track(t) {
                tracks.push(track);
            }
        }
    }

    let is_album = item.get("is_album").and_then(|v| v.as_bool())
        .or_else(|| item.get("set_type").and_then(|st| st.as_str()).map(|s| s == "album"));
    let release_year = item.get("release_date")
        .and_then(|d| d.as_str())
        .and_then(|s| s.split('-').next().map(|y| y.to_string()))
        .or_else(|| item.get("created_at").and_then(|d| d.as_str()).and_then(|s| s.split('-').next().map(|y| y.to_string())));

    Some(PlaylistItem {
        id,
        title,
        artist,
        artist_id,
        artwork_url,
        track_count,
        duration_ms,
        permalink_url,
        tracks,
        is_album,
        release_year,
    })
}

fn urlencoding(input: &str) -> String {
    let normalized = input.replace('+', " ");
    let mut encoded = String::new();
    for byte in normalized.bytes() {
        match byte {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char);
            }
            b' ' => {
                encoded.push_str("%20");
            }
            _ => {
                encoded.push_str(&format!("%{:02X}", byte));
            }
        }
    }
    encoded
}
