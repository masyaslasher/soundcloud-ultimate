use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackItem {
    pub id: u64,
    pub title: String,
    pub artist: String,
    pub artist_id: Option<u64>,
    pub artist_avatar: Option<String>,
    pub artwork_url: Option<String>,
    pub duration_ms: u64,
    pub playback_count: Option<u64>,
    pub likes_count: Option<u64>,
    pub waveform_url: Option<String>,
    pub stream_url: Option<String>,
    pub genre: Option<String>,
    pub permalink_url: Option<String>,
    pub liked: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: u64,
    pub username: String,
    pub avatar_url: Option<String>,
    pub permalink_url: Option<String>,
    pub followers_count: Option<u64>,
    pub followings_count: Option<u64>,
    pub likes_count: Option<u64>,
    pub playlist_count: Option<u64>,
    pub description: Option<String>,
    pub city: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtistProfile {
    pub id: u64,
    pub username: String,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub city: Option<String>,
    pub country: Option<String>,
    pub followers_count: Option<u64>,
    pub followings_count: Option<u64>,
    pub track_count: Option<u64>,
    pub likes_count: Option<u64>,
    pub is_following: Option<bool>,
    pub tracks: Vec<TrackItem>,
    pub playlists: Vec<PlaylistItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistItem {
    pub id: u64,
    pub title: String,
    pub artist: String,
    pub artist_id: Option<u64>,
    pub artwork_url: Option<String>,
    pub track_count: u64,
    pub duration_ms: u64,
    pub permalink_url: Option<String>,
    pub tracks: Vec<TrackItem>,
    pub is_album: Option<bool>,
    pub release_year: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommentItem {
    pub id: u64,
    pub body: String,
    pub timestamp_ms: Option<u64>,
    pub created_at: String,
    pub user_id: u64,
    pub username: String,
    pub user_avatar: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResponse {
    pub tracks: Vec<TrackItem>,
    pub playlists: Vec<PlaylistItem>,
    pub users: Vec<UserProfile>,
    pub next_href: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamResponse {
    pub stream_url: String,
    pub protocol: String,
    pub mime_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthStatus {
    pub authenticated: bool,
    pub user: Option<UserProfile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostCommentPayload {
    pub body: String,
    pub timestamp_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalMix {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub badge: String,
    pub artwork_url: String,
    pub accent_color: String,
    pub tracks: Vec<TrackItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HomeFeedResponse {
    pub recently_played: Vec<TrackItem>,
    pub more_of_what_you_like: Vec<TrackItem>,
    #[serde(default)]
    pub mixed_for_you: Vec<PersonalMix>,
    pub from_artists_you_follow: Vec<TrackItem>,
    pub trending: Vec<TrackItem>,
}
