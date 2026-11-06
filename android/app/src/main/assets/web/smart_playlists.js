/**
 * SoundCloud Ultimate — Rule-Based Smart Playlist Engine
 * Phase 6: Automatic Playlists Based on Listening Habits, Rules & Filters
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'sc_smart_playlists_custom_v1';

  // 5 Pre-built Curated Smart Rules
  const BUILTIN_SMART_PLAYLISTS = [
    {
      id: 'smart-heavy-rotation',
      title: 'Heavy Rotation',
      icon: '🔥',
      desc: 'Tracks you have played 3 or more times recently',
      rules: { minPlays: 3 },
      limit: 50
    },
    {
      id: 'smart-forgotten-gems',
      title: 'Forgotten Gems',
      icon: '💎',
      desc: 'Tracks from your favorites that you haven’t heard lately',
      rules: { likedOnly: true, minDaysAgo: 7 },
      limit: 40
    },
    {
      id: 'smart-weekly-discoveries',
      title: 'Discovered This Week',
      icon: '⚡',
      desc: 'Fresh tracks discovered and played in the last 7 days',
      rules: { maxDaysAgo: 7 },
      limit: 30
    },
    {
      id: 'smart-quick-bangers',
      title: 'Quick Bangers',
      icon: '💥',
      desc: 'High-energy fast tracks under 3 minutes long',
      rules: { maxDurationSec: 180 },
      limit: 35
    },
    {
      id: 'smart-late-night-chill',
      title: 'Late Night Chill',
      icon: '🌙',
      desc: 'Ambient, Downtempo & Phonk tracks for late night sessions',
      rules: { genres: ['ambient', 'phonk', 'electronic', 'chill', 'lo-fi'] },
      limit: 40
    }
  ];

  let customPlaylists = loadCustomPlaylists();

  function loadCustomPlaylists() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  }

  function saveCustomPlaylists() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPlaylists));
    } catch (_) {}
  }

  // Gather track repository from Local Likes, Local History and Queue
  function getCandidateTracks() {
    const map = new Map();

    // From Local Likes
    try {
      const likes = JSON.parse(localStorage.getItem('sc_local_likes') || '[]');
      likes.forEach(t => {
        if (t && t.id) {
          map.set(t.id, Object.assign({ isLiked: true, playCount: 1, lastPlayed: Date.now() }, t));
        }
      });
    } catch (_) {}

    // From Local History
    try {
      const history = JSON.parse(localStorage.getItem('sc_local_history') || '[]');
      history.forEach(t => {
        if (t && t.id) {
          const existing = map.get(t.id) || t;
          existing.playCount = (existing.playCount || 1) + 1;
          existing.lastPlayed = t.playedAt || Date.now();
          map.set(t.id, existing);
        }
      });
    } catch (_) {}

    // From Analytics Events
    try {
      const events = JSON.parse(localStorage.getItem('sc_listening_analytics_v1') || '[]');
      events.forEach(e => {
        if (e && e.id) {
          const existing = map.get(e.id) || {
            id: e.id,
            title: e.title,
            artist: e.artist,
            artwork_url: e.artwork_url,
            duration_ms: e.duration_ms
          };
          existing.playCount = (existing.playCount || 0) + 1;
          existing.lastPlayed = Math.max(existing.lastPlayed || 0, e.timestamp || 0);
          map.set(e.id, existing);
        }
      });
    } catch (_) {}

    return Array.from(map.values());
  }

  // Evaluate Rules on Candidate Tracks
  function evaluateSmartPlaylist(pl) {
    const candidates = getCandidateTracks();
    const rules = pl.rules || {};
    const now = Date.now();

    const matched = candidates.filter(track => {
      // Rule 1: minPlays
      if (rules.minPlays && (track.playCount || 0) < rules.minPlays) return false;

      // Rule 2: likedOnly
      if (rules.likedOnly && !track.isLiked) return false;

      // Rule 3: maxDaysAgo
      if (rules.maxDaysAgo && track.lastPlayed) {
        const days = (now - track.lastPlayed) / 86400000;
        if (days > rules.maxDaysAgo) return false;
      }

      // Rule 4: minDaysAgo (tracks NOT played recently)
      if (rules.minDaysAgo && track.lastPlayed) {
        const days = (now - track.lastPlayed) / 86400000;
        if (days < rules.minDaysAgo) return false;
      }

      // Rule 5: maxDurationSec
      if (rules.maxDurationSec && track.duration_ms) {
        if (track.duration_ms / 1000 > rules.maxDurationSec) return false;
      }

      // Rule 6: minDurationSec
      if (rules.minDurationSec && track.duration_ms) {
        if (track.duration_ms / 1000 < rules.minDurationSec) return false;
      }

      // Rule 7: keyword in title or artist
      if (rules.keyword) {
        const kw = rules.keyword.toLowerCase();
        const tStr = `${track.title || ''} ${track.artist || ''}`.toLowerCase();
        if (!tStr.includes(kw)) return false;
      }

      // Rule 8: genres match
      if (rules.genres && rules.genres.length > 0) {
        const tGenre = (track.genre || '').toLowerCase();
        const matches = rules.genres.some(g => tGenre.includes(g.toLowerCase()));
        if (!matches) {
          // If track doesn't specify genre, include if title/artist tags match
          const tTags = `${track.title || ''} ${track.artist || ''}`.toLowerCase();
          if (!rules.genres.some(g => tTags.includes(g.toLowerCase()))) return false;
        }
      }

      return true;
    });

    const limit = pl.limit || 50;
    return matched.slice(0, limit);
  }

  // Render Smart Playlists Modal & Hub
  function renderSmartPlaylistsModal() {
    let overlay = document.getElementById('smart-playlists-modal-overlay');
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'smart-playlists-modal-overlay';
    overlay.className = 'bento-modal-overlay';

    overlay.innerHTML = `
      <div class="bento-modal smart-playlists-modal" style="max-width: 820px;">
        <div class="modal-header">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            <span>Smart Rule-Based Playlists</span>
            <span class="studio-badge">Dynamic</span>
          </div>
          <button class="modal-close-btn" id="btn-close-smart-pl">✕</button>
        </div>

        <div style="padding: 12px 28px 0; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 13px; color: var(--text-dim);">
            Dynamic playlists generated on-the-fly based on your listening telemetry and custom rules.
          </div>
          <button class="action-btn" id="btn-create-custom-smart-pl" style="padding: 7px 16px; border-radius: 999px; background: var(--orange-neon); color: #fff; font-weight: 700; border: none; cursor: pointer;">
            + New Smart Playlist
          </button>
        </div>

        <div class="modal-body" id="smart-playlists-list-container" style="padding: 18px 28px 28px;">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-close-smart-pl')?.addEventListener('click', closeSmartPlaylists);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSmartPlaylists();
    });

    document.getElementById('btn-create-custom-smart-pl')?.addEventListener('click', openCustomPlaylistCreator);
  }

  function updateSmartPlaylistsView() {
    const container = document.getElementById('smart-playlists-list-container');
    if (!container) return;

    const allPlaylists = [...BUILTIN_SMART_PLAYLISTS, ...customPlaylists];
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'smart-pl-grid';

    allPlaylists.forEach(pl => {
      const tracks = evaluateSmartPlaylist(pl);
      const isCustom = !pl.id.startsWith('smart-');

      const card = document.createElement('div');
      card.className = 'smart-pl-card';

      card.innerHTML = `
        <div class="smart-pl-icon">${pl.icon || '📂'}</div>
        <div class="smart-pl-info">
          <div class="smart-pl-title-row">
            <span class="smart-pl-title">${pl.title}</span>
            <span class="smart-pl-badge">${tracks.length} tracks</span>
          </div>
          <div class="smart-pl-desc">${pl.desc || 'Custom rule-based playlist'}</div>
        </div>
        <div class="smart-pl-actions">
          <button class="btn-play-smart" title="Play Smart Playlist">▶ Play</button>
          ${isCustom ? `<button class="btn-del-smart" title="Delete custom smart playlist">🗑️</button>` : ''}
        </div>
      `;

      card.querySelector('.btn-play-smart').addEventListener('click', () => {
        playSmartPlaylist(pl, tracks);
      });

      if (isCustom) {
        card.querySelector('.btn-del-smart')?.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomPlaylist(pl.id);
        });
      }

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function playSmartPlaylist(pl, tracks) {
    if (!tracks || tracks.length === 0) {
      if (window.showToast) window.showToast(`⚠️ No tracks currently match rules for "${pl.title}"`);
      return;
    }

    if (window.QueueManager) {
      window.QueueManager.setQueue(tracks);
      window.QueueManager.playIndex(0);
    } else {
      // Fallback
      if (window.playTrack) {
        window.playTrack(tracks[0], 0);
      }
    }

    closeSmartPlaylists();
    if (window.showToast) window.showToast(`▶ Playing Smart Playlist: ${pl.title} (${tracks.length} tracks)`);
  }

  function openCustomPlaylistCreator() {
    const modal = document.createElement('div');
    modal.className = 'bento-modal-overlay open';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
      <div class="bento-modal custom-pl-creator-modal" style="max-width: 520px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>✨ Create Custom Smart Playlist</span>
          </div>
          <button class="modal-close-btn" id="btn-close-creator">✕</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Playlist Name</label>
            <input type="text" id="creator-pl-name" class="search-input" style="width: 100%; margin-top: 6px;" placeholder="e.g. Synth Wave Bangers">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Playlist Icon</label>
            <input type="text" id="creator-pl-icon" class="search-input" style="width: 100%; margin-top: 6px;" value="⚡" maxlength="4">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Filter by Keyword / Artist</label>
            <input type="text" id="creator-pl-kw" class="search-input" style="width: 100%; margin-top: 6px;" placeholder="Optional keyword...">
          </div>
          <div style="display: flex; gap: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Min Play Count</label>
              <input type="number" id="creator-pl-min-plays" class="search-input" style="width: 100%; margin-top: 6px;" value="1" min="0" max="50">
            </div>
            <div style="flex: 1;">
              <label style="font-size: 12px; color: var(--text-dim); font-weight: 600;">Max Track Count</label>
              <input type="number" id="creator-pl-limit" class="search-input" style="width: 100%; margin-top: 6px;" value="30" min="5" max="100">
            </div>
          </div>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-main); margin-top: 6px; cursor: pointer;">
            <input type="checkbox" id="creator-pl-liked-only">
            <span>Only include liked favorites</span>
          </label>
          <button class="action-btn" id="btn-save-creator" style="width: 100%; padding: 12px; border-radius: 999px; background: var(--orange-neon); color: #fff; font-weight: 700; border: none; cursor: pointer; margin-top: 10px;">
            Save & Generate Playlist
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-creator').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('#btn-save-creator').addEventListener('click', () => {
      const name = modal.querySelector('#creator-pl-name').value.trim() || 'Custom Smart Playlist';
      const icon = modal.querySelector('#creator-pl-icon').value.trim() || '⚡';
      const kw = modal.querySelector('#creator-pl-kw').value.trim();
      const minPlays = parseInt(modal.querySelector('#creator-pl-min-plays').value, 10) || 0;
      const limit = parseInt(modal.querySelector('#creator-pl-limit').value, 10) || 30;
      const likedOnly = modal.querySelector('#creator-pl-liked-only').checked;

      const newPl = {
        id: 'custom-' + Date.now(),
        title: name,
        icon: icon,
        desc: `Custom smart rule: min ${minPlays} plays${kw ? `, keyword "${kw}"` : ''}`,
        rules: {
          minPlays: minPlays > 0 ? minPlays : undefined,
          keyword: kw || undefined,
          likedOnly: likedOnly || undefined
        },
        limit: limit
      };

      customPlaylists.push(newPl);
      saveCustomPlaylists();
      modal.remove();
      updateSmartPlaylistsView();
      if (window.showToast) window.showToast(`✨ Smart Playlist "${name}" Created`);
    });
  }

  function deleteCustomPlaylist(id) {
    if (confirm('Delete this custom smart playlist?')) {
      customPlaylists = customPlaylists.filter(p => p.id !== id);
      saveCustomPlaylists();
      updateSmartPlaylistsView();
      if (window.showToast) window.showToast('🗑️ Smart Playlist Deleted');
    }
  }

  function openSmartPlaylists() {
    renderSmartPlaylistsModal();
    const overlay = document.getElementById('smart-playlists-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      updateSmartPlaylistsView();
    }
  }

  function closeSmartPlaylists() {
    const overlay = document.getElementById('smart-playlists-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  // Public Interface
  window.SmartPlaylists = {
    open: openSmartPlaylists,
    close: closeSmartPlaylists,
    evaluate: evaluateSmartPlaylist,
    getBuiltin: () => BUILTIN_SMART_PLAYLISTS,
    getCustom: () => customPlaylists
  };

})(window);
