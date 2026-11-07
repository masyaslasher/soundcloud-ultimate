pub mod api;
pub mod audio;
pub mod config;
pub mod discord;
pub mod models;

pub use api::SoundCloudApi;
pub use audio::AudioPlayer;
pub use config::AppConfig;
pub use discord::{DiscordActivityPayload, DiscordRpcManager, DiscordStatusResponse};
pub use models::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_config_defaults() {
        let cfg = AppConfig::default();
        assert_eq!(cfg.volume, 0.8);
        assert!(cfg.discord_rpc);
        assert!(cfg.liked_tracks.is_empty());
        assert!(cfg.custom_playlists.is_empty());
    }

    #[test]
    fn test_custom_playlist_management() {
        let mut cfg = AppConfig::default();
        let id = cfg.add_custom_playlist("Phonk Mix".to_string(), Some("Late night drive".to_string()));
        assert_eq!(cfg.custom_playlists.len(), 1);
        assert_eq!(cfg.custom_playlists[0].title, "Phonk Mix");

        let track = TrackItem {
            id: 12345,
            title: "Neon Shadows".to_string(),
            artist: "CyberArtist".to_string(),
            artist_id: Some(999),
            artist_avatar: None,
            artwork_url: Some("https://example.com/art.jpg".to_string()),
            duration_ms: 180000,
            playback_count: Some(5000),
            likes_count: Some(250),
            waveform_url: None,
            stream_url: None,
            genre: Some("Phonk".to_string()),
            permalink_url: None,
            liked: None,
        };

        cfg.add_track_to_playlist(&id, track.clone());
        assert_eq!(cfg.custom_playlists[0].tracks.len(), 1);
        assert_eq!(cfg.custom_playlists[0].tracks[0].title, "Neon Shadows");

        cfg.remove_track_from_playlist(&id, 12345);
        assert_eq!(cfg.custom_playlists[0].tracks.len(), 0);

        cfg.remove_custom_playlist(&id);
        assert!(cfg.custom_playlists.is_empty());
    }

    #[test]
    fn test_like_toggle() {
        let mut cfg = AppConfig::default();
        let track = TrackItem {
            id: 9999,
            title: "Midnight".to_string(),
            artist: "Echo".to_string(),
            artist_id: None,
            artist_avatar: None,
            artwork_url: None,
            duration_ms: 120000,
            playback_count: None,
            likes_count: None,
            waveform_url: None,
            stream_url: None,
            genre: None,
            permalink_url: None,
            liked: None,
        };

        let liked = cfg.toggle_like(track.clone());
        assert!(liked);
        assert!(cfg.is_liked(9999));

        let unliked = cfg.toggle_like(track);
        assert!(!unliked);
        assert!(!cfg.is_liked(9999));
    }
}
