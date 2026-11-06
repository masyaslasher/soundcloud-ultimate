use crate::models::{
    ArtistProfile, AuthStatus, CommentItem, PlaylistItem, PostCommentPayload, SearchResponse,
    StreamResponse, TrackItem, UserProfile,
};
use regex::Regex;
use serde_json::Value;
use std::{fs, path::PathBuf, process::Command, sync::Arc};
use tokio::sync::RwLock;

const DEFAULT_CLIENT_ID: &str = "8UvlHph8Fhze3ZixMeSkFXj4Dwkblsjt";
const USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

#[derive(Clone)]
pub struct SoundCloudClient {
    client: reqwest::Client,
    client_id: Arc<RwLock<String>>,
    oauth_token: Arc<RwLock<Option<String>>>,
    config_path: PathBuf,
}

impl SoundCloudClient {
    pub fn new(proxy_url: Option<String>) -> Self {
        let mut builder = reqwest::Client::builder()
            .user_agent(USER_AGENT);

        if let Some(ref p) = proxy_url
            && let Ok(proxy) = reqwest::Proxy::all(p) {
                builder = builder.proxy(proxy);
            }

        let client = builder.build().unwrap_or_default();

        let base_dir = if cfg!(windows) {
            std::env::var("APPDATA")
                .or_else(|_| std::env::var("USERPROFILE"))
                .map(PathBuf::from)
                .unwrap_or_else(|_| PathBuf::from("."))
        } else {
            let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
            PathBuf::from(home).join(".config")
        };
        let config_path = base_dir.join("soundcloud-desktop").join("auth.json");

        let mut saved_token = if config_path.exists() {
            fs::read_to_string(&config_path)
                .ok()
                .and_then(|txt| serde_json::from_str::<Value>(&txt).ok())
                .and_then(|v| v.get("oauth_token").and_then(|t| t.as_str()).map(|s| s.to_string()))
        } else {
            None
        };

        if saved_token.is_none()
            && let Some(imported) = auto_import_browser_token_sync() {
                println!("✨ Auto-imported active SoundCloud session from browser!");
                let data = serde_json::json!({ "oauth_token": &imported });
                let _ = fs::create_dir_all(config_path.parent().unwrap());
                let _ = fs::write(&config_path, data.to_string());
                saved_token = Some(imported);
            }

        Self {
            client,
            client_id: Arc::new(RwLock::new(DEFAULT_CLIENT_ID.to_string())),
            oauth_token: Arc::new(RwLock::new(saved_token)),
            config_path,
        }
    }

    pub fn raw_client(&self) -> &reqwest::Client {
        &self.client
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
                        && let Some(id_match) = cap.get(1) {
                            let new_id = id_match.as_str().to_string();
                            let mut write_guard = self.client_id.write().await;
                            *write_guard = new_id.clone();
                            return Ok(new_id);
                        }
        }

        let id = self.client_id.read().await.clone();
        Ok(id)
    }

    pub async fn get_client_id(&self) -> String {
        self.client_id.read().await.clone()
    }

    pub async fn get_oauth_token(&self) -> Option<String> {
        self.oauth_token.read().await.clone()
    }

    pub async fn set_oauth_token(&self, token: Option<String>) {
        let mut guard = self.oauth_token.write().await;
        *guard = token.clone();

        if let Some(ref t) = token {
            let data = serde_json::json!({ "oauth_token": t });
            let _ = fs::create_dir_all(self.config_path.parent().unwrap());
            let _ = fs::write(&self.config_path, data.to_string());
        } else {
            let _ = fs::remove_file(&self.config_path);
        }
    }

    pub async fn auto_import_from_browser(&self) -> Result<UserProfile, String> {
        let token = auto_import_browser_token_sync().ok_or_else(|| "No session found in browser".to_string())?;
        self.set_oauth_token(Some(token)).await;
        self.get_me().await
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
        let token = self.get_oauth_token().await;
        if token.is_some() {
            match self.get_me().await {
                Ok(profile) => AuthStatus {
                    authenticated: true,
                    user: Some(profile),
                },
                Err(_) => AuthStatus {
                    authenticated: false,
                    user: None,
                },
            }
        } else {
            AuthStatus {
                authenticated: false,
                user: None,
            }
        }
    }

    pub async fn get_me(&self) -> Result<UserProfile, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let client_id = self.get_client_id().await;
        let url = format!("https://api-v2.soundcloud.com/me?client_id={}", client_id);

        let req = self.client.get(&url);
        let req = self.apply_auth(req, Some(&token));

        let resp = req.send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let id = val.get("id").and_then(|v| v.as_u64()).ok_or_else(|| "Invalid user id".to_string())?;
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

        Ok(UserProfile {
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
        })
    }

    /// Full Artist Profile with uploaded tracks and playlists
    pub async fn get_artist_profile(&self, artist_id: u64) -> Result<ArtistProfile, String> {
        let client_id = self.get_client_id().await;
        let token = self.get_oauth_token().await;

        let user_url = format!("https://api-v2.soundcloud.com/users/{}?client_id={}", artist_id, client_id);
        let req = self.client.get(&user_url);
        let req = self.apply_auth(req, token.as_deref());
        let user_val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;

        let username = user_val.get("username").and_then(|v| v.as_str()).unwrap_or("Artist").to_string();
        let avatar_url = user_val.get("avatar_url").and_then(|v| v.as_str()).map(|s| s.replace("-large.jpg", "-t500x500.jpg"));
        let description = user_val.get("description").and_then(|d| d.as_str()).map(|s| s.to_string());
        let city = user_val.get("city").and_then(|c| c.as_str()).map(|s| s.to_string());
        let country = user_val.get("country").and_then(|c| c.as_str()).map(|s| s.to_string());
        let followers_count = user_val.get("followers_count").and_then(|v| v.as_u64());
        let followings_count = user_val.get("followings_count").and_then(|v| v.as_u64());
        let track_count = user_val.get("track_count").and_then(|v| v.as_u64());
        let likes_count = user_val.get("public_favorites_count").and_then(|v| v.as_u64());

        // Tracks
        let tracks_url = format!("https://api-v2.soundcloud.com/users/{}/tracks?client_id={}&limit=30", artist_id, client_id);
        let req_tracks = self.apply_auth(self.client.get(&tracks_url), token.as_deref());
        let tracks_val: Value = req_tracks.send().await.map_err(|e| e.to_string())?.json().await.unwrap_or_default();
        let tracks = parse_track_collection(&tracks_val);

        // Playlists
        let pl_url = format!("https://api-v2.soundcloud.com/users/{}/playlists?client_id={}&limit=12", artist_id, client_id);
        let req_pl = self.apply_auth(self.client.get(&pl_url), token.as_deref());
        let pl_val: Value = req_pl.send().await.map_err(|e| e.to_string())?.json().await.unwrap_or_default();
        let mut playlists = Vec::new();
        if let Some(col) = pl_val.get("collection").and_then(|c| c.as_array()).or_else(|| pl_val.as_array()) {
            for item in col {
                if let Some(p) = parse_single_playlist(item) {
                    playlists.push(p);
                }
            }
        }

        let is_following = user_val.get("following").and_then(|v| v.as_bool());

        Ok(ArtistProfile {
            id: artist_id,
            username,
            avatar_url,
            description,
            city,
            country,
            followers_count,
            followings_count,
            track_count,
            likes_count,
            is_following,
            tracks,
            playlists,
        })
    }

    /// Follow or Unfollow an artist
    pub async fn toggle_follow(&self, artist_id: u64, follow: bool) -> Result<bool, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let client_id = self.get_client_id().await;
        let url = format!("https://api-v2.soundcloud.com/me/followings/{}?client_id={}", artist_id, client_id);

        let req = if follow {
            self.client.put(&url)
        } else {
            self.client.delete(&url)
        };

        let req = self.apply_auth(req, Some(&token));
        let resp = req.send().await.map_err(|e| e.to_string())?;
        Ok(resp.status().is_success())
    }

    /// Related Tracks (Track Station / Radio)
    pub async fn get_related_tracks(&self, track_id: u64, limit: usize) -> Result<Vec<TrackItem>, String> {
        let client_id = self.get_client_id().await;
        let token = self.get_oauth_token().await;
        let url = format!(
            "https://api-v2.soundcloud.com/tracks/{}/related?client_id={}&limit={}",
            track_id, client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, token.as_deref());
        let val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;

        Ok(parse_track_collection(&val))
    }

    /// Fetch Comments for a Track
    pub async fn get_track_comments(&self, track_id: u64, limit: usize) -> Result<Vec<CommentItem>, String> {
        let client_id = self.get_client_id().await;
        let token = self.get_oauth_token().await;
        let url = format!(
            "https://api-v2.soundcloud.com/tracks/{}/comments?client_id={}&limit={}&threaded=0",
            track_id, client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, token.as_deref());
        let val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;

        let mut comments = Vec::new();
        if let Some(col) = val.get("collection").and_then(|c| c.as_array()) {
            for item in col {
                if let (Some(id), Some(body)) = (item.get("id").and_then(|v| v.as_u64()), item.get("body").and_then(|b| b.as_str())) {
                    let timestamp_ms = item.get("timestamp").and_then(|t| t.as_u64());
                    let created_at = item.get("created_at").and_then(|c| c.as_str()).unwrap_or("").to_string();
                    let user = item.get("user");
                    let user_id = user.and_then(|u| u.get("id")).and_then(|i| i.as_u64()).unwrap_or(0);
                    let username = user.and_then(|u| u.get("username")).and_then(|u| u.as_str()).unwrap_or("User").to_string();
                    let user_avatar = user.and_then(|u| u.get("avatar_url")).and_then(|a| a.as_str()).map(|s| s.to_string());

                    comments.push(CommentItem {
                        id,
                        body: body.to_string(),
                        timestamp_ms,
                        created_at,
                        user_id,
                        username,
                        user_avatar,
                    });
                }
            }
        }

        Ok(comments)
    }

    /// Post a comment on a track
    pub async fn post_comment(&self, track_id: u64, payload: PostCommentPayload) -> Result<CommentItem, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let client_id = self.get_client_id().await;
        let url = format!("https://api-v2.soundcloud.com/tracks/{}/comments?client_id={}", track_id, client_id);

        let body = serde_json::json!({
            "comment": {
                "body": payload.body,
                "timestamp": payload.timestamp_ms.unwrap_or(0)
            }
        });

        let req = self.client.post(&url).json(&body);
        let req = self.apply_auth(req, Some(&token));
        let val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;

        let id = val.get("id").and_then(|v| v.as_u64()).ok_or_else(|| "Invalid comment id".to_string())?;
        let b = val.get("body").and_then(|b| b.as_str()).unwrap_or("").to_string();
        let timestamp_ms = val.get("timestamp").and_then(|t| t.as_u64());
        let created_at = val.get("created_at").and_then(|c| c.as_str()).unwrap_or("").to_string();
        let user = val.get("user");
        let user_id = user.and_then(|u| u.get("id")).and_then(|i| i.as_u64()).unwrap_or(0);
        let username = user.and_then(|u| u.get("username")).and_then(|u| u.as_str()).unwrap_or("User").to_string();
        let user_avatar = user.and_then(|u| u.get("avatar_url")).and_then(|a| a.as_str()).map(|s| s.to_string());

        Ok(CommentItem {
            id,
            body: b,
            timestamp_ms,
            created_at,
            user_id,
            username,
            user_avatar,
        })
    }

    /// Full Playlist Details with full tracks list
    pub async fn get_playlist(&self, playlist_id: u64) -> Result<PlaylistItem, String> {
        let client_id = self.get_client_id().await;
        let token = self.get_oauth_token().await;
        let url = format!("https://api-v2.soundcloud.com/playlists/{}?client_id={}", playlist_id, client_id);

        let req = self.client.get(&url);
        let req = self.apply_auth(req, token.as_deref());
        let val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.map_err(|e| e.to_string())?;

        let mut playlist = parse_single_playlist(&val).ok_or_else(|| "Failed to parse playlist".to_string())?;

        // Check if there are stub tracks that need full metadata
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
                && let Ok(full_tracks_val) = resp.json::<Value>().await {
                    let full_tracks = parse_track_collection(&full_tracks_val);
                    let mut track_map: std::collections::HashMap<u64, TrackItem> = full_tracks.into_iter().map(|t| (t.id, t)).collect();

                    for t in playlist.tracks.iter_mut() {
                        if t.title == "Unknown Title"
                            && let Some(resolved) = track_map.remove(&t.id) {
                                *t = resolved;
                            }
                    }
                }
        }

        playlist.tracks.retain(|t| t.title != "Unknown Title");

        Ok(playlist)
    }

    /// User's Listening History
    pub async fn get_my_history(&self, limit: usize) -> Result<Vec<TrackItem>, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let client_id = self.get_client_id().await;
        let url = format!(
            "https://api-v2.soundcloud.com/me/play-history/tracks?client_id={}&limit={}",
            client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, Some(&token));

        let resp = req.send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let mut tracks = Vec::new();
        if let Some(col) = val.get("collection").and_then(|c| c.as_array()) {
            for item in col {
                let track_val = item.get("track").unwrap_or(item);
                if let Some(t) = parse_single_track(track_val) {
                    tracks.push(t);
                }
            }
        }
        Ok(tracks)
    }

    pub async fn get_my_likes(&self, limit: usize, _offset: usize) -> Result<Vec<TrackItem>, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let me = self.get_me().await?;
        let client_id = self.get_client_id().await;

        let url = format!(
            "https://api-v2.soundcloud.com/users/{}/track_likes?client_id={}&limit={}",
            me.id, client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, Some(&token));

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

        Ok(tracks)
    }

    pub async fn get_my_playlists(&self, limit: usize) -> Result<Vec<PlaylistItem>, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let me = self.get_me().await?;
        let client_id = self.get_client_id().await;

        let url = format!(
            "https://api-v2.soundcloud.com/users/{}/playlists?client_id={}&limit={}",
            me.id, client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, Some(&token));

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

    pub async fn get_my_stream(&self, limit: usize) -> Result<Vec<TrackItem>, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let client_id = self.get_client_id().await;

        let url = format!(
            "https://api-v2.soundcloud.com/stream?client_id={}&limit={}",
            client_id, limit
        );

        let req = self.client.get(&url);
        let req = self.apply_auth(req, Some(&token));

        let resp = req.send().await.map_err(|e| e.to_string())?;
        let val: Value = resp.json().await.map_err(|e| e.to_string())?;

        let mut tracks = Vec::new();
        if let Some(col) = val.get("collection").and_then(|c| c.as_array()) {
            for item in col {
                let track_val = item.get("track").unwrap_or(item);
                if let Some(t) = parse_single_track(track_val) {
                    tracks.push(t);
                }
            }
        }

        Ok(tracks)
    }

    pub async fn toggle_like(&self, track_id: u64, like: bool) -> Result<bool, String> {
        let token = self.get_oauth_token().await.ok_or_else(|| "Not logged in".to_string())?;
        let client_id = self.get_client_id().await;
        let url = format!(
            "https://api-v2.soundcloud.com/likes/tracks/{}?client_id={}",
            track_id, client_id
        );

        let req = if like {
            self.client.post(&url)
        } else {
            self.client.delete(&url)
        };

        let req = self.apply_auth(req, Some(&token));
        let resp = req.send().await.map_err(|e| e.to_string())?;

        Ok(resp.status().is_success())
    }

    pub async fn search(&self, query: &str, limit: usize, offset: usize) -> Result<SearchResponse, String> {
        let client_id = self.get_client_id().await;
        let token = self.get_oauth_token().await;

        // Tracks
        let tracks_url = format!(
            "https://api-v2.soundcloud.com/search/tracks?q={}&client_id={}&limit={}&offset={}",
            urlencoding(query),
            client_id,
            limit,
            offset
        );

        let req = self.client.get(&tracks_url);
        let req = self.apply_auth(req, token.as_deref());
        let val: Value = req.send().await.map_err(|e| e.to_string())?.json().await.unwrap_or_default();
        let tracks = parse_track_collection(&val);

        // Playlists
        let pl_url = format!(
            "https://api-v2.soundcloud.com/search/playlists?q={}&client_id={}&limit=8",
            urlencoding(query),
            client_id
        );
        let mut playlists = Vec::new();
        if let Ok(pl_resp) = self.client.get(&pl_url).send().await
            && let Ok(pl_val) = pl_resp.json::<Value>().await
                && let Some(col) = pl_val.get("collection").and_then(|c| c.as_array()) {
                    for item in col {
                        if let Some(p) = parse_single_playlist(item) {
                            playlists.push(p);
                        }
                    }
                }

        // Users / Artists
        let u_url = format!(
            "https://api-v2.soundcloud.com/search/users?q={}&client_id={}&limit=6",
            urlencoding(query),
            client_id
        );
        let mut users = Vec::new();
        if let Ok(u_resp) = self.client.get(&u_url).send().await
            && let Ok(u_val) = u_resp.json::<Value>().await
            && let Some(col) = u_val.get("collection").and_then(|c| c.as_array())
        {
            for item in col {
                if let (Some(id), Some(username)) = (item.get("id").and_then(|v| v.as_u64()), item.get("username").and_then(|u| u.as_str())) {
                    users.push(UserProfile {
                        id,
                        username: username.to_string(),
                        avatar_url: item.get("avatar_url").and_then(|a| a.as_str()).map(|s| s.replace("-large.jpg", "-t500x500.jpg")),
                        permalink_url: item.get("permalink_url").and_then(|p| p.as_str()).map(|s| s.to_string()),
                        followers_count: item.get("followers_count").and_then(|f| f.as_u64()),
                        followings_count: item.get("followings_count").and_then(|f| f.as_u64()),
                        likes_count: item.get("likes_count").and_then(|l| l.as_u64()),
                        playlist_count: item.get("playlist_count").and_then(|p| p.as_u64()),
                        description: item.get("description").and_then(|d| d.as_str()).map(|s| s.to_string()),
                        city: item.get("city").and_then(|c| c.as_str()).map(|s| s.to_string()),
                    });
                }
            }
        }

        let next_href = val.get("next_href").and_then(|v| v.as_str()).map(|s| s.to_string());

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
            let fallback = self.search("trending", limit, 0).await?;
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

    pub async fn resolve_track_stream(&self, track_id: u64) -> Result<StreamResponse, String> {
        let client_id = self.get_client_id().await;
        let token = self.get_oauth_token().await;

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

    pub async fn download_track_bytes(&self, track_id: u64) -> Result<(String, Vec<u8>), String> {
        let track = self.get_track_by_id(track_id).await?;
        let stream = self.resolve_track_stream(track_id).await?;

        if stream.protocol == "progressive" {
            let bytes = self.client.get(&stream.stream_url).send().await
                .map_err(|e| e.to_string())?
                .bytes().await
                .map_err(|e| e.to_string())?;
            let filename = format!("{} - {}.mp3", track.artist, track.title);
            return Ok((filename, bytes.to_vec()));
        }

        // HLS audio download: fetch playlist, download and concatenate audio segments
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

        let filename = format!("{} - {}.mp3", track.artist, track.title);
        Ok((filename, full_audio_bytes))
    }
}

const EMBEDDED_EXTRACT_SCRIPT: &str = include_str!("../extract_browser_token.py");

fn auto_import_browser_token_sync() -> Option<String> {
    let mut candidate_paths = vec![PathBuf::from("extract_browser_token.py")];
    if let Ok(exe) = std::env::current_exe()
        && let Some(parent) = exe.parent()
    {
        candidate_paths.push(parent.join("extract_browser_token.py"));
    }

    let script_path = if let Some(existing) = candidate_paths.into_iter().find(|p| p.exists()) {
        existing
    } else {
        let temp_script = std::env::temp_dir().join("sc_extract_browser_token.py");
        if fs::write(&temp_script, EMBEDDED_EXTRACT_SCRIPT).is_ok() {
            temp_script
        } else {
            return None;
        }
    };

    let python_cmd = if cfg!(windows) { "python" } else { "python3" };

    let output = Command::new(python_cmd).arg(&script_path).output().ok()?;
    if !output.status.success() {
        return None;
    }

    let json_val: Value = serde_json::from_slice(&output.stdout).ok()?;
    if json_val.get("success")?.as_bool()? {
        json_val.get("oauth_token").and_then(|v| v.as_str()).map(|s| s.to_string())
    } else {
        None
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

fn parse_single_track(item: &Value) -> Option<TrackItem> {
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

fn parse_single_playlist(item: &Value) -> Option<PlaylistItem> {
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
    })
}

fn urlencoding(input: &str) -> String {
    let mut encoded = String::new();
    for byte in input.bytes() {
        match byte {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char);
            }
            _ => {
                encoded.push_str(&format!("%{:02X}", byte));
            }
        }
    }
    encoded
}
