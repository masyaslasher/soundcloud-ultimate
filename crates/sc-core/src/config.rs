use crate::models::{CustomPlaylist, TrackItem, UploadedTrack, UserProfile};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub oauth_token: Option<String>,
    pub public_profile_url: Option<String>,
    pub current_user: Option<UserProfile>,
    #[serde(default)]
    pub custom_playlists: Vec<CustomPlaylist>,
    #[serde(default)]
    pub liked_tracks: Vec<TrackItem>,
    #[serde(default)]
    pub recently_played: Vec<TrackItem>,
    #[serde(default)]
    pub my_uploaded_tracks: Vec<UploadedTrack>,
    #[serde(default = "default_volume")]
    pub volume: f32,
    #[serde(default = "default_true")]
    pub discord_rpc: bool,
}

fn default_volume() -> f32 {
    0.8
}

fn default_true() -> bool {
    true
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            oauth_token: None,
            public_profile_url: None,
            current_user: None,
            custom_playlists: Vec::new(),
            liked_tracks: Vec::new(),
            recently_played: Vec::new(),
            my_uploaded_tracks: Vec::new(),
            volume: default_volume(),
            discord_rpc: true,
        }
    }
}

impl AppConfig {
    pub fn app_dir() -> PathBuf {
        let base_dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        base_dir.join("soundcloud-ultimate")
    }

    pub fn config_path() -> PathBuf {
        Self::app_dir().join("config.json")
    }

    pub fn uploads_dir() -> PathBuf {
        Self::app_dir().join("uploads")
    }

    pub fn themes_dir() -> PathBuf {
        Self::app_dir().join("themes")
    }

    pub fn addons_dir() -> PathBuf {
        Self::app_dir().join("addons")
    }

    pub fn ensure_dirs() -> Result<(), std::io::Error> {
        fs::create_dir_all(Self::app_dir())?;
        fs::create_dir_all(Self::uploads_dir())?;
        fs::create_dir_all(Self::themes_dir())?;
        fs::create_dir_all(Self::addons_dir())?;
        Ok(())
    }

    pub fn load() -> Self {
        let _ = Self::ensure_dirs();
        let path = Self::config_path();
        if path.exists()
            && let Ok(content) = fs::read_to_string(&path)
                && let Ok(config) = serde_json::from_str::<Self>(&content) {
                    return config;
                }
        Self::default()
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::config_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(&path, json).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn add_custom_playlist(&mut self, title: String, description: Option<String>) -> String {
        let id = format!("pl_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
        let pl = CustomPlaylist {
            id: id.clone(),
            title,
            description,
            artwork_url: None,
            tracks: Vec::new(),
            created_at: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        };
        self.custom_playlists.push(pl);
        let _ = self.save();
        id
    }

    pub fn remove_custom_playlist(&mut self, id: &str) {
        self.custom_playlists.retain(|p| p.id != id);
        let _ = self.save();
    }

    pub fn add_track_to_playlist(&mut self, playlist_id: &str, track: TrackItem) {
        if let Some(pl) = self.custom_playlists.iter_mut().find(|p| p.id == playlist_id)
            && !pl.tracks.iter().any(|t| t.id == track.id) {
                if pl.artwork_url.is_none() {
                    pl.artwork_url = track.artwork_url.clone();
                }
                pl.tracks.push(track);
                let _ = self.save();
            }
    }

    pub fn remove_track_from_playlist(&mut self, playlist_id: &str, track_id: u64) {
        if let Some(pl) = self.custom_playlists.iter_mut().find(|p| p.id == playlist_id) {
            pl.tracks.retain(|t| t.id != track_id);
            let _ = self.save();
        }
    }

    pub fn record_played_track(&mut self, track: TrackItem) {
        self.recently_played.retain(|t| t.id != track.id);
        self.recently_played.insert(0, track);
        if self.recently_played.len() > 50 {
            self.recently_played.truncate(50);
        }
        let _ = self.save();
    }

    pub fn toggle_like(&mut self, track: TrackItem) -> bool {
        let exists = self.liked_tracks.iter().position(|t| t.id == track.id);
        if let Some(idx) = exists {
            self.liked_tracks.remove(idx);
            let _ = self.save();
            false
        } else {
            let mut t = track;
            t.liked = Some(true);
            self.liked_tracks.insert(0, t);
            let _ = self.save();
            true
        }
    }

    pub fn is_liked(&self, track_id: u64) -> bool {
        self.liked_tracks.iter().any(|t| t.id == track_id)
    }

    pub fn add_uploaded_track(&mut self, track: UploadedTrack) {
        self.my_uploaded_tracks.retain(|t| t.id != track.id);
        self.my_uploaded_tracks.insert(0, track);
        let _ = self.save();
    }

    pub fn delete_uploaded_track(&mut self, track_id: u64) -> Option<UploadedTrack> {
        let pos = self.my_uploaded_tracks.iter().position(|t| t.id == track_id)?;
        let track = self.my_uploaded_tracks.remove(pos);
        let _ = self.save();
        Some(track)
    }

    pub fn update_uploaded_track(
        &mut self,
        track_id: u64,
        title: String,
        genre: Option<String>,
        tags: Option<String>,
        description: Option<String>,
    ) {
        if let Some(track) = self.my_uploaded_tracks.iter_mut().find(|t| t.id == track_id) {
            track.title = title;
            track.genre = genre;
            track.tags = tags;
            track.description = description;
            let _ = self.save();
        }
    }

    pub fn update_profile(
        &mut self,
        username: Option<String>,
        description: Option<String>,
        city: Option<String>,
        avatar_url: Option<String>,
    ) -> Option<UserProfile> {
        if let Some(user) = self.current_user.as_mut() {
            if let Some(u) = username {
                user.username = u;
            }
            if let Some(d) = description {
                user.description = Some(d);
            }
            if let Some(c) = city {
                user.city = Some(c);
            }
            if let Some(a) = avatar_url {
                user.avatar_url = Some(a);
            }
            let cloned = user.clone();
            let _ = self.save();
            Some(cloned)
        } else {
            let user = UserProfile {
                id: 1,
                username: username.unwrap_or_else(|| "Quiet Listener".to_string()),
                avatar_url,
                permalink_url: Some("https://soundcloud.com/me".to_string()),
                followers_count: Some(0),
                followings_count: Some(0),
                likes_count: Some(self.liked_tracks.len() as u64),
                playlist_count: Some(self.custom_playlists.len() as u64),
                description,
                city,
                country: None,
            };
            self.current_user = Some(user.clone());
            let _ = self.save();
            Some(user)
        }
    }
}
