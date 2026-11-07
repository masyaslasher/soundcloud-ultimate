# SoundCloud Ultimate Customization SDK

SoundCloud Ultimate provides an extensible customization architecture for themes and add-ons without requiring changes to core binaries. All user customizations are stored in your user configuration directory:

- Linux: `~/.config/soundcloud-ultimate/`
- Windows: `%APPDATA%\soundcloud-ultimate\`

---

## 1. Custom Themes (`theme.json`)

Themes allow customizing UI color palettes while preserving window framing (`100vh`, `overflow: hidden`, fixed titlebar, sidebar, and pinned player dock).

### Directory Structure

```
~/.config/soundcloud-ultimate/themes/
└── <theme_id>/
    ├── theme.json
    └── custom.css (optional)
```

### `theme.json` Specification

```json
{
  "id": "quiet-dark-amoled",
  "name": "Quiet Dark AMOLED",
  "author": "SoundCloud Ultimate",
  "version": "1.0.0",
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
}
```

### CSS Variable Mapping

When a theme is applied, its tokens map directly to root CSS custom properties:

| Token | CSS Variable | Description |
|---|---|---|
| `bg_window` | `--bg-window` | App background and root container |
| `bg_surface` | `--bg-surface` | Sidebar, cards, and modal background |
| `bg_elevated` | `--bg-elevated` | Hover states, active chips, tooltips |
| `accent` | `--accent-primary` | Primary brand accent color |
| `accent_hover` | `--accent-hover` | Accent color hover and active state |
| `text_primary` | `--text-primary` | Main text, titles, headings |
| `text_muted` | `--text-muted` | Secondary text, timestamps, captions |
| `border_subtle` | `--border-subtle` | Thin dividing lines and borders |
| `player_bg` | `--player-bg` | Pinned bottom player dock background |

---

## 2. Add-ons & Plugins Engine (`manifest.json`)

By default, SoundCloud Ultimate ships with zero pre-installed or demo plugins. The `addons/` directory is clean and empty. Any third-party add-on must be placed into `addons/<addon_id>/`.

### Directory Structure

```
~/.config/soundcloud-ultimate/addons/
└── <addon_id>/
    ├── manifest.json
    └── index.js
```

### `manifest.json` Specification

```json
{
  "id": "sample-visualizer-addon",
  "name": "Sample Visualizer Addon",
  "version": "1.0.0",
  "description": "An example add-on extending the player dock",
  "entry": "index.js",
  "enabled": true
}
```

---

## 3. JavaScript SDK (`window.SCPluginAPI`)

The client provides `window.SCPluginAPI` inside the desktop web view. All hooks are isolated with error handling to avoid disrupting core playback.

### API Reference

#### Events

- `SCPluginAPI.onTrackChange(callback)`
  Invoked when the currently playing track changes.
  ```javascript
  window.SCPluginAPI.onTrackChange((track) => {
    console.log("Playing:", track.title, "by", track.artist);
  });
  ```

- `SCPluginAPI.onPlayStateChange(callback)`
  Invoked when playback is paused or resumed.
  ```javascript
  window.SCPluginAPI.onPlayStateChange((isPlaying) => {
    console.log("State:", isPlaying ? "Playing" : "Paused");
  });
  ```

- `SCPluginAPI.onViewChange(callback)`
  Invoked when user navigates between views (`view-home`, `view-search`, `view-profile`, etc.).
  ```javascript
  window.SCPluginAPI.onViewChange((viewId) => {
    console.log("Active view:", viewId);
  });
  ```

#### Player & State Inspection

- `SCPluginAPI.getCurrentTrack()`: Returns the active `TrackItem` object or `null`.
- `SCPluginAPI.getQueue()`: Returns an array of queued tracks.
- `SCPluginAPI.getAudioContext()`: Returns the underlying `AudioContext` for audio visualization or DSP nodes.

#### UI Extensions

- `SCPluginAPI.addPlayerButton({ id, svg, tooltip, onClick })`
  Inserts a custom button into the player dock.
  ```javascript
  window.SCPluginAPI.addPlayerButton({
    id: "my-custom-btn",
    tooltip: "My Custom Action",
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    onClick: () => {
      window.SCPluginAPI.showToast("Custom button clicked");
    }
  });
  ```

- `SCPluginAPI.showToast(message)`
  Displays a native in-app toast notification.
  ```javascript
  window.SCPluginAPI.showToast("Add-on initialized successfully");
  ```

---

## 4. Core Discord Rich Presence

Discord Rich Presence is permanently integrated directly into the Rust backend (`sc-core` & `desktop`). It operates autonomously:
- Launches alongside the application in a background worker thread.
- Automatically reconnects to the Discord IPC socket (`/run/user/<uid>/discord-ipc-0` on Linux, `\\.\pipe\discord-ipc-0` on Windows).
- Broadcasts current track title, artist, artwork URL, and real-time playback timestamps.
- Requires no user intervention and has no toggle switch in UI.
