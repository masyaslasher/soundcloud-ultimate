<div align="center">

# ☁️ SoundCloud Ultimate (Bento AMOLED Edition)

[![Release](https://img.shields.io/github/v/release/masyaslasher/soundcloud-ultimate?style=for-the-badge&color=FF5500)](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest)
[![Rust](https://img.shields.io/badge/Rust-1.80+-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Android](https://img.shields.io/badge/Android-APK%20(v1.3.0)-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Android%20%7C%20Chrome-blue?style=for-the-badge)](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>🌐 Language:</strong>
  <a href="README.md"><strong>English</strong></a> •
  <a href="README_RU.md">Русский (README_RU.md)</a>
</p>

<p align="center">
  <b>Next-generation standalone native desktop & Android client for SoundCloud.</b><br>
  Built with <b>Rust</b>, <b>Tao + Wry</b>, native <b>Android (Java/Gradle)</b>, and modern <b>AMOLED Bento Glass</b> aesthetics. Includes built-in <b>Zapret Anti-DPI engine & DNS-over-HTTPS</b> (bypasses ISP blocks in Russia without VPN), <b>10 custom AMOLED themes</b>, <b>synchronized lyrics & karaoke</b>, <b>360° 8D Audio studio</b>, <b>background playback & lockscreen media controls</b> on Android, and a <b>100% in-app ecosystem</b>.
</p>

</div>

---

## ⚡ Quick Download (Latest Version v1.3.0)

| Platform | File | Instructions |
| :--- | :--- | :--- |
| 📱 **Android APK** | [**`SoundCloud-Ultimate.apk`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Standalone Android App. Background playback, lock screen widget, and zero-VPN DoH bypass |
| 🪟 **Windows Native Portable** | [**`SoundCloud-Ultimate-Windows-x86_64-Portable.zip`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Extract and launch `soundcloud-desktop.exe` (native standalone window via WebView2, zero browser launch) |
| 🪟 **Windows .EXE** | [**`SoundCloud-Ultimate-Portable.exe`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Standalone single executable for Windows |
| 🐧 **Linux AppImage** | [**`SoundCloud-Ultimate-x86_64.AppImage`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | `chmod +x SoundCloud-Ultimate-x86_64.AppImage` and run (native WebKitGTK window) |
| 🐧 **Debian / Ubuntu** | [**`soundcloud-ultimate_1.3.0_amd64.deb`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Install via `sudo dpkg -i soundcloud-ultimate_1.3.0_amd64.deb` |
| 🐧 **Linux Standalone** | [**`soundcloud-ultimate-linux-x86_64.tar.gz`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Extract: `tar -xvf soundcloud-ultimate-linux-x86_64.tar.gz && ./run.sh` |
| 🧩 **Chrome Extension** | [**`soundcloud-ultimate-chrome-extension-v1.3.0.zip`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Enable Developer Mode in `chrome://extensions` and click "Load unpacked" |


---

## 📸 Interface Gallery / Screenshots

<div align="center">

### 1. 10 AMOLED Bento Color Themes
![Themes Grid](screenshots/09_themes_10_palettes.png)

### 2. Built-in Extensions Hub (Discord RPC, Lyrics Karaoke, FX Studio, Looper, Sleep Timer, Social Bento Cards)
![Extensions Hub](screenshots/discord_rpc_extensions.png)

### 3. Synchronized Lyrics (Karaoke LRCLIB) & A-B Looper in Nordic Frost Theme
<p align="center">
  <img src="screenshots/15_lyrics_karaoke.png" width="48%" alt="Karaoke Synchronized Lyrics" />
  &nbsp;&nbsp;
  <img src="screenshots/16_nordic_frost_looper.png" width="48%" alt="Nordic Frost & A-B Looper" />
</p>

### 4. Cyberpunk 2077 Theme & Midnight Synthwave Theme
<p align="center">
  <img src="screenshots/13_cyberpunk_neon_theme.png" width="48%" alt="Cyberpunk 2077 Theme" />
  &nbsp;&nbsp;
  <img src="screenshots/14_synthwave_theme.png" width="48%" alt="Synthwave Theme" />
</p>

### 5. Audio FX Studio: 8D Audio (360° Binaural Spatializer) & Pitch Control (Nightcore, Slowed)
![Audio FX Studio](screenshots/11_audio_fx_8d_studio.png)

### 6. Social Bento Track Card Generator (for Discord, Telegram & Twitter/X)
![Bento Social Track Card](screenshots/12_bento_social_track_card.png)

### 7. Discover & Trending Chart Feed
![Main Discover](screenshots/01_main_discover.png)

### 8. Native In-App Artist Profile with Direct Follow & Discography
![Artist Profile](screenshots/02_in_app_artist_profile.png)

### 9. In-App Playlist & Album Inspector
![Playlist Inspector](screenshots/03_in_app_playlist_inspector.png)

### 10. Real-Time Timestamped Comments
![Comments System](screenshots/04_in_app_comments_system.png)

### 11. Laser Centered Bento Volume Slider & 5-Band Studio Equalizer
<p align="center">
  <img src="screenshots/06_bento_laser_volume.png" width="32%" alt="Volume Slider" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="screenshots/07_studio_equalizer.png" width="58%" alt="Studio Equalizer" />
</p>

</div>

---

## 🎨 10 Built-in AMOLED Themes

Switch themes instantly with a single click via the **"Themes (10)"** header button. Features persistent state and dynamic ambient canvas smoke matching each color palette:

1. **🧡 Onyx Orange** — Signature AMOLED Bento Glass with iconic neon orange `#FF5500`.
2. **⚡ Cyberpunk 2077** — Electric cyber yellow `#FFE600`, neon cyan `#00F0FF`, and Night City dark slate.
3. **🌆 Midnight Synthwave** — Neon magenta `#F72585`, deep ultraviolet `#7209B7`, and 80s retrowave atmosphere.
4. **🟢 Matrix Emerald** — Hacker CRT terminal, radioactive phosphor `#00FF66`, and dark matrix green.
5. **❄️ Nordic Frost** — Arctic ice cyan `#00D2FF`, crystalline sapphire `#38BDF8`, and deep oceanic navy.
6. **🩸 Crimson Blood** — Vampire obsidian `#0C0406`, ruby blood `#FF1E56`, and dark carmine accents.
7. **🌸 Sakura Blossom** — Tokyo cherry blossom night, pastel neon `#FF66C4`, and rose gold hues.
8. **🍯 Solar Amber** — Liquid amber gold `#FFB703`, sunset horizon, and warm premium tones.
9. **🔮 Hyperpop Acid** — Acid lime `#A3E635`, deep amethyst purple, and aggressive hyperpop style.
10. **💎 Monochrome Titanium** — Pure black onyx `#000000`, platinum white `#FFFFFF`, and titanium minimalism.

---

## 🧩 7 Built-in Power Extensions

1. **🎤 Karaoke & Synchronized Lyrics (`K`):**
   - Automatic synced lyrics search powered by LRCLIB API based on artist and track metadata.
   - Real-time line-by-line sync scrolling with active vocal highlighting.
   - Click any lyric line to jump directly to that timestamp in the track.
2. **🌙 Smart Sleep Timer:**
   - Automatically stops playback after 15, 30, 45, 60, 90 minutes or "at the end of the current track".
   - Smooth 30-second volume fade-out prevents sudden silence while falling asleep.
   - Live countdown badge in the bottom player dock (`🌙 24:18`).
3. **🎛️ Audio FX Studio (`F`):**
   - **8D Audio Spatializer (360°):** Hardware-accelerated binaural audio rotation around listener's head in headphones with animated radar.
   - **Nightcore Mode (1.25x):** Speed and pitch boost with bright harmonics.
   - **Slowed + Reverb (0.85x):** Atmospheric chopped & slowed sound with deep bass.
   - **Vaporwave Mode (0.75x) & Smooth Pitch Slider (0.5x – 2.0x).**
4. **🔁 A-B Precision Looper (`[`, `]`, `\`):**
   - Set loop start `[A]` and loop end `[B]` on the fly while listening.
   - Visual loop markers and highlighted region on the progress bar.
   - Seamless infinite playback of your favorite drops, guitar solos, or beats.
5. **🪪 Social Bento Track Card Generator:**
   - Instantly generates AMOLED-styled track cards on HTML5 Canvas matching your active theme.
   - Includes artwork, sound wave, metadata, and lossless quality badge.
   - One-click copy to clipboard or download as PNG for Discord, Telegram, Twitter/X, and VK.
6. **🎮 Discord Rich Presence (Cross-Platform for Linux & Windows):**
   - Pure native Rust Discord IPC client built directly into the core engine with zero external dependencies.
   - Full cross-platform support: Unix domain sockets on Linux (`/run/user/<uid>/discord-ipc-*`, `$XDG_RUNTIME_DIR`, Flatpak, Snap) and Named Pipes on Windows (`\\.\pipe\discord-ipc-*`).
   - Real-time Discord profile status:
     - **Activity Type:** "Listening to SoundCloud"
     - **Track Info:** Title and artist (`by ...`)
     - **Live Animated Timeline:** Automatic `start` and `end` timestamps displaying the live progress bar in Discord.
     - **Artwork:** Full-resolution album cover and SoundCloud badge.
     - **Interactive Button:** "Listen on SoundCloud" button linking directly to the track.
     - **In-App Control:** Live status indicator in Extensions Hub (`Active • Connected as @user`), auto-reconnect worker, and on/off toggle.
7. **🌐 8-Language Localization Hub (`Alt+Shift+L`):**
   - Seamless native localization across 8 languages: English (🇺🇸), Russian (🇷🇺), German (🇩🇪), French (🇫🇷), Japanese (🇯🇵), Ukrainian (🇺🇦), Polish (🇵🇱), and Armenian (🇦🇲).
   - Dedicated AMOLED Bento modal dialog with native language titles, country flags, and real-time active indicators.
   - Accessible via the Built-in Extensions Hub, User Profile Dropdown, or keyboard shortcut `Alt + Shift + L`.
   - The main header and playback screens remain clean and distraction-free.

---

## ✨ Core Features

### 🖥️ True Native Desktop Application (Rust + Tao + Wry)
- **Zero Browser Dependencies:** Unlike Electron or browser wrappers, SoundCloud Ultimate runs as a true native desktop application powered by `tao` and `wry` (WebKitGTK on Linux, WebView2 on Windows). In the process manager, it runs strictly as `soundcloud-desktop` without spawning Chromium or browser tabs.
- **⚡ Built-in Zapret Anti-DPI Engine:**
  - Native socket-level Record Splitting (TLS ClientHello split into 2 bytes + Cloudflare/Google DoH).
  - Complete bypass of Russian ISP/RKN blocking without needing a VPN or external proxy.
  - Zero CPU overhead, fully driverless (runs entirely in user-space, no administrator rights needed).
- **100% In-App Ecosystem:** No external browser tabs. Artist profiles, albums, playlists, track comments, and related radio stations render inside the app.
- **100% Guest Mode & Optional Sign-In:**
  - Zero forced authentication: listen to Trending, search tracks, enjoy 8D audio, synced lyrics, equalizer, and looper instantly without an account.
  - Persistent Local Favorites (`❤️ Liked`) & Local History (`🕒 History`) saved on your device in Guest Mode.
  - Connect your SoundCloud account anytime via 1-Click browser import or manual token only when desired.
- **SoundCloud Account Integration (Optional):**
  - ⚡ **1-Click Sign In:** Auto-imports existing session cookies from Chromium/Chrome on demand without manual token extraction.
  - ❤️ **Liked Tracks:** Instant access to your entire saved music library.
  - 📂 **Playlists:** Browse, manage, and play your private and public playlists.
  - 📡 **Personal Stream:** Keep up with latest releases from artists you follow.
- **Studio 5-Band Equalizer & Bass Boost (`E`):**
  - Dedicated sliders: 60Hz, 250Hz, 1kHz, 4kHz, 12kHz (-12dB to +12dB).
  - Presets for Bass Boost, Electronic, Vocal, and Rock.
- **Bento Laser Volume Slider:**
  - Hover or click the speaker icon to open the centered AMOLED volume popup.
  - Smooth logarithmic curve and mouse wheel support.
- **High Quality Audio Streams:**
  - Direct HLS / AAC / MP3 streaming with automatic client fallback.
  - One-click track download (`D`).

---

### 📱 Standalone Android Application (`SoundCloud-Ultimate.apk`)
- **🎧 Background Audio Playback:**
  - Full `ForegroundService` with `PARTIAL_WAKE_LOCK`. Music streams seamlessly with screen locked, device sleeping, or while using other apps.
- **📲 Lock Screen & Notification Center Media Widget:**
  - AndroidX `MediaSessionCompat` and `NotificationCompat.MediaStyle`.
  - Control playback directly from the lock screen: Play/Pause, Previous, Next, track title, artist name, and seekbar.
- **🛡️ Built-in DoH (Bypasses Russian Blocking without VPN):**
  - Native OkHttp DNS-over-HTTPS client querying Cloudflare (`1.1.1.1`) and Google (`8.8.8.8`).
  - Seamlessly bypasses TSPU/RKN DNS poisoning on mobile cellular networks (MTS, MegaFon, Beeline, Tele2) and Wi-Fi.
- **🖤 AMOLED Bento Glass Responsive UI:**
  - Optimized for mobile touch gestures, edge-to-edge AMOLED display, and ultra-low battery consumption.
- **📦 Ultra-Lightweight:**
  - Entire standalone APK is only **6.3 MB**!


---

## 🚀 SoundCloud Ultimate Expansion Suite (v1.4.0)

SoundCloud Ultimate has evolved into a professional-grade music workstation and personal analytics platform.

### 🎨 1. Theme Studio & Centralized Design Tokens
- **15 Curated Presets**: Minimal Graphite, AMOLED Pure Black, Minimal Dark, Clean Light, Purple Minimal, plus 10 classic AMOLED neon palettes.
- **Full Appearance Customizer**: Pick custom colors for background, surface, dock, borders, text, and accent glow.
- **Interface Density**: Choose between Compact (high information density), Comfortable (default), or Expanded modes.
- **Typography & Geometry**: Adjust interface font family, border radius (square to pill), and layout proportions.
- **Persistence & Portability**: Live instant previews, local storage persistence, and JSON theme import/export.

### 📊 2. Personal Listening Analytics & Wrapped
- **Local Event Tracking**: Efficiently logs playback events, tracks completed, skip rates, and listening sessions without external telemetry.
- **Interactive Metrics**: Total listening time (hours), unique tracks, active listening streak counter, and most active listening hours.
- **Visual Analytics**: Real-time SVG listening activity graph, artist leaderboard, top tracks ranking, and genre distribution.
- **Annual Wrapped Report**: Generate a sharable yearly music review card highlighting your top artist, total minutes, and top tracks.
- **Data Privacy**: Complete data export to CSV and JSON, with 1-click local analytics purge.

### ⚡ 3. Smart Playlists Engine
- **Rule-Based Automation**: Automatically generates dynamic playlists evaluated in real-time across your liked tracks, listening history, and local library.
- **Built-in Smart Mixes**:
  - *Dusty Gems*: Liked tracks not played in the last 30 days.
  - *Heavy Rotation*: Your most frequently played tracks (> 5 plays).
  - *Fresh Discoveries*: Newly discovered tracks added this week.
  - *Short Bops*: Upbeat tracks under 3 minutes.
  - *Long Journeys*: Extended mixes and DJ sets over 7 minutes.
- **Custom Rule Builder**: Create custom playlists with field matching (Title, Artist, Genre, Duration, Play count) and operators (Equals, Contains, Greater/Less than).

### 🧭 4. Music Discovery & Recommendation Engine
- **Local Affinity Scoring**: Recommends underground gems and tracks based on your unique listening history and genre preferences without requiring external paid AI APIs.
- **4 Discovery Channels**: Similar Tracks, Underground Discoveries (< 25k plays), Forgotten Favorites, and Random Genre Deep-Dive.
- **Interactive Feedback System**: "More like this" (👍), "Less like this" (👎), and "Hide Recommendation" (👁️) to refine recommendations on the fly.

### 📑 5. Advanced Playback Queue Manager
- **Drag & Drop Reordering**: Rearrange upcoming tracks on the fly with smooth drag-and-drop handles.
- **Smart Shuffle**: Intelligent shuffling algorithm that spreads tracks from the same artist evenly across the queue.
- **Duplicate Detection**: Identifies and flags duplicate tracks in the queue with a 1-click deduplication tool.
- **Session History & Presets**: Save your current queue into named snapshots, restore previous queues, and clear queue with confirmation.

### 🎛️ 6. 6-Mode Audio Visualizer Studio
- **Real WebAudio Engine**: Connected directly to the master playback pipeline via WebAudio `AnalyserNode` (2048 FFT, 48 kHz).
- **6 Visualizer Modes**:
  1. *Frequency Spectrum*: Classic hardware audio spectrum analyzer bars.
  2. *Oscilloscope Waveform*: Smooth green CRT oscilloscope time-domain waveform.
  3. *Circular Radial*: 360-degree radial frequency spikes.
  4. *Bass Pulse*: Rhythmic low-frequency reactor with dynamic radial rings.
  5. *Stereo Peak Meter*: Professional dB VU meters for Left & Right channels with peak hold.
  6. *Minimalist Zen*: Ultra-clean subtle sound wave.
- **Hardware Controls**: Sensitivity multiplier, FPS limiter (30 / 60 FPS) to conserve battery on laptops, and stream diagnostics.

### 🔍 7. Deep Track Inspector & Stream Diagnostics
- **Detailed Metadata**: Inspect track IDs, upload dates, play counts, like counts, repost counts, licenses, and direct SoundCloud permalinks.
- **Audio Stream Pipeline**: View transcoding formats (HLS `m3u8` vs Progressive `mp3`), estimated bitrates (128 kbps MP3 vs 256 kbps AAC HQ), and Anti-DPI bypass proxy routing.
- **Raw JSON Inspector**: View and copy formatted raw track payloads from the SoundCloud API.

### ⚡ 8. Live Telemetry & Performance Monitor
- **Real-Time System Metrics**: Native Axum `/api/system/metrics` endpoint reporting exact process RSS memory, uptime, and host specs.
- **Client Telemetry**: Live rendering frame rate (FPS sparkline), JS Heap allocation, and audio buffer health (seconds buffered ahead).
- **Cache Management**: 1-click buffer refresh and memory cache trimming.

### 🧩 9. Extensibility & Plugin Studio SDK
- **Sandboxed Plugin Runtime**: Extensible lifecycle hooks (`init`, `onTrackChange`, `onPlaybackState`, `destroy`).
- **3 Built-in Studio Plugins**:
  - *BPM Counter & Beat Tapper*: Interactive tap-tempo tool and genre tempo estimator.
  - *Music Context & Trivia*: Smart trivia facts and historical music roots for currently playing artists.
  - *Zen Focus Mode*: Calming distraction-free study mode that minimizes interface contrast.
- **Custom Plugin Importer**: Easily import and run custom community JavaScript extensions.

### 🪟 10. Mini Player HUD Mode
- **Compact Floating Widget**: Minimalist floating player view showing artwork, track title, artist, live seek bar, and playback controls.
- **Quick Keyboard Shortcut**: Toggle instantly by pressing `M` on any screen.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `Alt + Left` | Previous Track |
| `Alt + Right` | Next Track |
| `L` | Like / Unlike Track |
| `M` | Toggle Mini Player HUD (or Mute when focused) |
| `I` | Open Track Inspector & Audio Diagnostics |
| `Q` | Open / Close Queue Manager |
| `K` | Toggle Synced Lyrics & Karaoke |
| `F` | Toggle Audio FX Studio (8D & Speed) |
| `[` | Set Looper Point [A] |
| `]` | Set Looper Point [B] |
| `\` | Toggle Looper Active |
| `E` | Open Equalizer & Bass Boost |
| `V` | Fullscreen Visualizer |
| `C` | Open Track Comments |
| `D` | Download Track |
| `S` | Toggle Shuffle |
| `R` | Cycle Repeat (Off / All / One) |
| `Esc` | Close Active Modal / Overlay |

---

## 🛠️ Building from Source

### Requirements
- **Rust & Cargo** (1.75+): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Node.js** (for building Chrome Extension): `v18+`

### Build Desktop App
```bash
git clone https://github.com/masyaslasher/soundcloud-ultimate.git
cd soundcloud-ultimate/desktop
cargo build --release
```
The compiled binary will be located at `target/release/soundcloud-desktop`.

### Build Android APK
```bash
cd soundcloud-ultimate/android
./gradlew assembleDebug
```
The compiled APK will be located at `app/build/outputs/apk/debug/app-debug.apk`.

### Build Chrome Extension

```bash
cd soundcloud-ultimate/extension
npm install
npm run build
```
Load the `dist/` folder into Chrome via `chrome://extensions` (Developer Mode).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

Developed with ❤️ for music enthusiasts worldwide.
