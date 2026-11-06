/**
 * SoundCloud Ultimate — Mini Player HUD Module
 * Ultra-compact, distraction-free desktop mini player mode with real-time controls.
 */

(function () {
  'use strict';

  let isMiniMode = false;
  let miniContainer = null;

  function ensureMiniOverlay() {
    if (miniContainer) return;

    miniContainer = document.createElement('div');
    miniContainer.id = 'sc-mini-player-hud';
    miniContainer.className = 'sc-mini-hud';
    miniContainer.innerHTML = `
      <div class="mini-hud-content">
        <div class="mini-hud-drag-handle" title="Mini Player">
          <span class="mini-drag-dots">⋮⋮</span>
          <span class="mini-hud-title">SoundCloud Mini</span>
          <button class="mini-hud-btn-expand" id="btn-mini-hud-expand" title="Return to Full Window">⤢</button>
        </div>

        <div class="mini-hud-track-row">
          <img id="mini-hud-art" class="mini-hud-art" src="assets/default_artwork.png" alt="Artwork" />
          <div class="mini-hud-info">
            <div id="mini-hud-title" class="mini-hud-track-title">No track playing</div>
            <div id="mini-hud-artist" class="mini-hud-track-artist">—</div>
          </div>
          <button class="mini-hud-icon-btn" id="btn-mini-hud-like" title="Favorite">♡</button>
        </div>

        <div class="mini-hud-progress-row">
          <span id="mini-hud-time-cur" class="mini-time">0:00</span>
          <div class="mini-hud-bar-wrap" id="mini-hud-bar">
            <div class="mini-hud-bar-fill" id="mini-hud-fill"></div>
          </div>
          <span id="mini-hud-time-dur" class="mini-time">0:00</span>
        </div>

        <div class="mini-hud-controls-row">
          <button class="mini-ctrl-btn" id="btn-mini-prev" title="Previous">⏮</button>
          <button class="mini-ctrl-btn mini-play" id="btn-mini-play" title="Play/Pause">▶</button>
          <button class="mini-ctrl-btn" id="btn-mini-next" title="Next">⏭</button>
        </div>
      </div>
    `;

    document.body.appendChild(miniContainer);

    // Event listeners
    miniContainer.querySelector('#btn-mini-hud-expand').addEventListener('click', toggleMiniPlayer);

    miniContainer.querySelector('#btn-mini-play').addEventListener('click', () => {
      if (typeof window.togglePlayPause === 'function') {
        window.togglePlayPause();
      }
    });

    miniContainer.querySelector('#btn-mini-prev').addEventListener('click', () => {
      if (typeof window.playPrev === 'function') {
        window.playPrev();
      }
    });

    miniContainer.querySelector('#btn-mini-next').addEventListener('click', () => {
      if (typeof window.playNext === 'function') {
        window.playNext();
      }
    });

    miniContainer.querySelector('#btn-mini-hud-like').addEventListener('click', () => {
      const cur = typeof window.getCurrentTrack === 'function' ? window.getCurrentTrack() : null;
      if (cur && typeof window.toggleLikeCurrentTrack === 'function') {
        window.toggleLikeCurrentTrack();
      }
    });

    // Seek listener on mini bar
    const bar = miniContainer.querySelector('#mini-hud-bar');
    bar.addEventListener('click', (e) => {
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const audioEl = document.querySelector('audio');
      if (audioEl && audioEl.duration) {
        audioEl.currentTime = ratio * audioEl.duration;
      }
    });
  }

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function syncTrackInfo(track) {
    if (!miniContainer) return;
    const titleEl = miniContainer.querySelector('#mini-hud-title');
    const artistEl = miniContainer.querySelector('#mini-hud-artist');
    const artEl = miniContainer.querySelector('#mini-hud-art');

    if (!track) {
      if (titleEl) titleEl.textContent = 'No track playing';
      if (artistEl) artistEl.textContent = '—';
      return;
    }

    if (titleEl) titleEl.textContent = track.title || 'Untitled';
    if (artistEl) artistEl.textContent = (track.user && track.user.username) || 'Unknown Artist';
    if (artEl) {
      const src = track.artwork_url ? track.artwork_url.replace('-large', '-t300x300') : (track.user && track.user.avatar_url ? track.user.avatar_url : 'assets/default_artwork.png');
      artEl.src = src;
    }
  }

  function syncPlaybackState(isPlaying) {
    if (!miniContainer) return;
    const playBtn = miniContainer.querySelector('#btn-mini-play');
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏸' : '▶';
    }
  }

  function syncProgress(currentTime, duration) {
    if (!miniContainer || !isMiniMode) return;
    const fill = miniContainer.querySelector('#mini-hud-fill');
    const curEl = miniContainer.querySelector('#mini-hud-time-cur');
    const durEl = miniContainer.querySelector('#mini-hud-time-dur');

    if (curEl) curEl.textContent = formatTime(currentTime);
    if (durEl) durEl.textContent = formatTime(duration);

    if (fill && duration > 0) {
      const pct = (currentTime / duration) * 100;
      fill.style.width = `${pct}%`;
    }
  }

  function toggleMiniPlayer() {
    isMiniMode = !isMiniMode;
    ensureMiniOverlay();

    if (isMiniMode) {
      document.body.classList.add('sc-mini-player-active');
      const cur = typeof window.getCurrentTrack === 'function' ? window.getCurrentTrack() : null;
      syncTrackInfo(cur);
      const audioEl = document.querySelector('audio');
      if (audioEl) {
        syncPlaybackState(!audioEl.paused);
      }
    } else {
      document.body.classList.remove('sc-mini-player-active');
    }
  }

  // Keyboard shortcut: Press 'M' outside of text inputs to toggle mini player
  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      toggleMiniPlayer();
    }
  });

  window.MiniPlayer = {
    toggle: toggleMiniPlayer,
    syncTrack: syncTrackInfo,
    syncState: syncPlaybackState,
    syncProgress: syncProgress,
    isActive: () => isMiniMode
  };
})();
