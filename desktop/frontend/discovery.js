/**
 * SoundCloud Ultimate — Music Discovery Engine
 * Phase 7: Personalized Recommendations, Underground Gems, Forgotten Favorites & Taste Profile
 */
(function(window) {
  'use strict';

  const STORAGE_TASTE = 'sc_discovery_taste_profile_v1';
  const STORAGE_HIDDEN = 'sc_discovery_hidden_tracks_v1';

  let tasteProfile = loadTasteProfile();
  let hiddenTrackIds = loadHiddenTrackIds();

  function loadTasteProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_TASTE);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      artists: {}, // { artistName: score }
      genres: {}   // { genreName: score }
    };
  }

  function saveTasteProfile() {
    try {
      localStorage.setItem(STORAGE_TASTE, JSON.stringify(tasteProfile));
    } catch (_) {}
  }

  function loadHiddenTrackIds() {
    try {
      const raw = localStorage.getItem(STORAGE_HIDDEN);
      if (raw) return new Set(JSON.parse(raw));
    } catch (_) {}
    return new Set();
  }

  function saveHiddenTrackIds() {
    try {
      localStorage.setItem(STORAGE_HIDDEN, JSON.stringify(Array.from(hiddenTrackIds)));
    } catch (_) {}
  }

  // Update taste score from feedback or playback
  function updateAffinity(artist, genre, delta) {
    if (artist) {
      const a = artist.toLowerCase();
      tasteProfile.artists[a] = (tasteProfile.artists[a] || 0) + delta;
    }
    if (genre) {
      const g = genre.toLowerCase();
      tasteProfile.genres[g] = (tasteProfile.genres[g] || 0) + delta;
    }
    saveTasteProfile();
  }

  // Feed Generator
  async function fetchDiscoveryFeed(type = 'recommended') {
    let endpoint = '/api/trending?genre=all-music&limit=30';

    if (type === 'underground') {
      endpoint = '/api/trending?genre=electronic&limit=30';
    } else if (type === 'hiphop') {
      endpoint = '/api/trending?genre=hiphoprap&limit=30';
    } else if (type === 'ambient') {
      endpoint = '/api/trending?genre=ambient&limit=30';
    }

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const rawTracks = data.tracks || [];

      // Filter out hidden tracks
      const filtered = rawTracks.filter(t => !hiddenTrackIds.has(t.id));

      // Heuristic scoring based on taste profile
      filtered.forEach(t => {
        let score = 10;
        const a = (t.artist || '').toLowerCase();
        const g = (t.genre || '').toLowerCase();

        if (tasteProfile.artists[a]) score += tasteProfile.artists[a] * 5;
        if (tasteProfile.genres[g]) score += tasteProfile.genres[g] * 3;

        // Underground boost: lower playback count with high likes gets priority in underground mode
        if (type === 'underground' && t.playback_count) {
          if (t.playback_count < 100000) score += 15;
          if (t.likes_count && t.playback_count) {
            const ratio = t.likes_count / t.playback_count;
            score += Math.round(ratio * 100);
          }
        }

        t._discoveryScore = score;
      });

      // Sort by discovery score
      filtered.sort((a, b) => b._discoveryScore - a._discoveryScore);
      return filtered;
    } catch (e) {
      console.warn('Failed to fetch discovery feed:', e);
      return [];
    }
  }

  // Render Discovery Hub Modal
  function renderDiscoveryModal() {
    let overlay = document.getElementById('discovery-hub-modal-overlay');
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'discovery-hub-modal-overlay';
    overlay.className = 'bento-modal-overlay';

    overlay.innerHTML = `
      <div class="bento-modal discovery-hub-modal" style="max-width: 860px; height: 85vh; display: flex; flex-direction: column;">
        <!-- Header -->
        <div class="modal-header" style="flex-shrink: 0;">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>Music Discovery & Recommendations</span>
            <span class="studio-badge">Heuristic</span>
          </div>
          <button class="modal-close-btn" id="btn-close-discovery-hub">✕</button>
        </div>

        <!-- Feed Selector Pills -->
        <div class="studio-nav-bar" style="margin: 0 24px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0;">
          <button class="studio-nav-btn active" data-feed="recommended">✨ For You</button>
          <button class="studio-nav-btn" data-feed="underground">💎 Underground Gems</button>
          <button class="studio-nav-btn" data-feed="ambient">🌙 Chill & Ambient</button>
          <button class="studio-nav-btn" data-feed="hiphop">🔥 Urban & Phonk</button>
        </div>

        <!-- Body Grid -->
        <div class="modal-body" id="discovery-tracks-grid" style="flex: 1; overflow-y: auto; padding: 18px 24px;">
          <div style="color: var(--text-dim); text-align: center; padding: 40px;">Generating personalized recommendations...</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event Bindings
    document.getElementById('btn-close-discovery-hub')?.addEventListener('click', closeDiscovery);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDiscovery();
    });

    overlay.querySelectorAll('.studio-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.studio-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadDiscoveryFeed(btn.dataset.feed);
      });
    });
  }

  async function loadDiscoveryFeed(feedType = 'recommended') {
    const grid = document.getElementById('discovery-tracks-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 40px;">Synthesizing discovery tracks...</div>';

    const tracks = await fetchDiscoveryFeed(feedType);

    grid.innerHTML = '';
    if (tracks.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 40px;">No recommendations found for this category</div>';
      return;
    }

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'discovery-cards-grid';

    tracks.forEach(t => {
      const card = document.createElement('div');
      card.className = 'discovery-track-card';

      card.innerHTML = `
        <div class="disc-art-wrap">
          <img src="${t.artwork_url || ''}" alt="" class="disc-art" onerror="this.style.display='none'">
          <button class="disc-play-btn" title="Play Now">▶</button>
        </div>
        <div class="disc-info">
          <div class="disc-title" title="${t.title}">${t.title}</div>
          <div class="disc-artist" title="${t.artist}">${t.artist}</div>
        </div>
        <div class="disc-feedback-bar">
          <button class="btn-feedback btn-thumb-up" title="More like this">👍</button>
          <button class="btn-feedback btn-thumb-down" title="Less like this">👎</button>
          <button class="btn-feedback btn-hide" title="Hide recommendation">👁️</button>
        </div>
      `;

      // Play
      card.querySelector('.disc-play-btn').addEventListener('click', () => {
        if (window.playTrack) {
          window.playTrack(t, 0);
          updateAffinity(t.artist, t.genre, 1);
        }
      });

      // Feedback: More like this
      card.querySelector('.btn-thumb-up').addEventListener('click', (e) => {
        e.stopPropagation();
        updateAffinity(t.artist, t.genre, 3);
        card.style.borderColor = 'var(--orange-neon)';
        if (window.showToast) window.showToast(`👍 Tuned algorithm for more by ${t.artist}`);
      });

      // Feedback: Less like this
      card.querySelector('.btn-thumb-down').addEventListener('click', (e) => {
        e.stopPropagation();
        updateAffinity(t.artist, t.genre, -3);
        card.style.opacity = '0.4';
        if (window.showToast) window.showToast(`👎 Tuned algorithm for less by ${t.artist}`);
      });

      // Feedback: Hide
      card.querySelector('.btn-hide').addEventListener('click', (e) => {
        e.stopPropagation();
        hiddenTrackIds.add(t.id);
        saveHiddenTrackIds();
        card.remove();
        if (window.showToast) window.showToast('👁️ Recommendation hidden');
      });

      cardsContainer.appendChild(card);
    });

    grid.appendChild(cardsContainer);
  }

  function openDiscovery() {
    renderDiscoveryModal();
    const overlay = document.getElementById('discovery-hub-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      loadDiscoveryFeed('recommended');
    }
  }

  function closeDiscovery() {
    const overlay = document.getElementById('discovery-hub-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  // Public Interface
  window.DiscoveryEngine = {
    open: openDiscovery,
    close: closeDiscovery,
    recordPlayback: (artist, genre) => updateAffinity(artist, genre, 1),
    getFeed: fetchDiscoveryFeed
  };

})(window);
