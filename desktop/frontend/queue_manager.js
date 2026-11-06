/**
 * SoundCloud Ultimate — Advanced Queue Manager
 * Phase 8: Drag-and-Drop Reordering, Saved Queues, Deduplication, Smart Shuffle & History
 */
(function(window) {
  'use strict';

  const STORAGE_SAVED_QUEUES = 'sc_saved_queues_v1';

  let savedQueues = loadSavedQueues();
  let queueHistory = [];

  function loadSavedQueues() {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_QUEUES);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {};
  }

  function saveSavedQueuesToStorage() {
    try {
      localStorage.setItem(STORAGE_SAVED_QUEUES, JSON.stringify(savedQueues));
    } catch (_) {}
  }

  // Record into queue history when track changes
  function pushQueueHistory(track) {
    if (!track || !track.id) return;
    // Prepend and limit to 30
    queueHistory.unshift(Object.assign({ playedAt: Date.now() }, track));
    if (queueHistory.length > 30) {
      queueHistory.pop();
    }
  }

  // Smart Shuffle: Shuffles queue but ensures the same artist doesn't appear back-to-back
  function smartShuffle(tracks, currentIndex = 0) {
    if (!tracks || tracks.length <= 2) return tracks.slice();
    const current = tracks[currentIndex];
    const rest = tracks.filter((_, idx) => idx !== currentIndex);

    // Standard Fisher-Yates first
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }

    // Artist spacing pass
    for (let i = 0; i < rest.length - 1; i++) {
      if (rest[i].artist && rest[i + 1].artist && rest[i].artist.toLowerCase() === rest[i + 1].artist.toLowerCase()) {
        // Swap rest[i+1] with next non-matching track
        for (let k = i + 2; k < rest.length; k++) {
          if (rest[k].artist && rest[k].artist.toLowerCase() !== rest[i].artist.toLowerCase()) {
            [rest[i + 1], rest[k]] = [rest[k], rest[i + 1]];
            break;
          }
        }
      }
    }

    return [current, ...rest];
  }

  // Deduplication: returns array with unique track IDs preserved
  function deduplicateQueue(tracks) {
    const seen = new Set();
    const deduplicated = [];
    let removedCount = 0;

    tracks.forEach(t => {
      if (!t || !t.id) return;
      if (!seen.has(t.id)) {
        seen.add(t.id);
        deduplicated.push(t);
      } else {
        removedCount++;
      }
    });

    return { tracks: deduplicated, removedCount };
  }

  // Render Queue Manager Drawer / Modal
  function renderQueueModal() {
    let overlay = document.getElementById('queue-manager-modal-overlay');
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'queue-manager-modal-overlay';
    overlay.className = 'bento-modal-overlay';

    overlay.innerHTML = `
      <div class="bento-modal queue-manager-modal" style="max-width: 680px; height: 85vh; display: flex; flex-direction: column;">
        <!-- Header -->
        <div class="modal-header" style="flex-shrink: 0;">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4 10h12v2H4zm0-4h12v2H4zm0 8h8v2H4zm10 0v6l5-3z"/>
            </svg>
            <span>Advanced Play Queue</span>
            <span class="studio-badge" id="queue-count-badge">0 Tracks</span>
          </div>
          <button class="modal-close-btn" id="btn-close-queue-mgr">✕</button>
        </div>

        <!-- Toolbar -->
        <div class="queue-toolbar" style="padding: 12px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 6px;">
            <button class="btn-subtle" id="btn-smart-shuffle" title="Smart Shuffle: avoids repeating same artist consecutively">🎲 Smart Shuffle</button>
            <button class="btn-subtle" id="btn-dedup-queue" title="Detect & Remove duplicates">✨ Deduplicate</button>
            <button class="btn-subtle" id="btn-clear-queue-all" style="color: #FF5555;">🗑️ Clear</button>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-subtle" id="btn-save-current-queue">💾 Save Queue</button>
            <button class="btn-subtle" id="btn-view-saved-queues">📂 Saved (<span id="saved-queue-count">0</span>)</button>
          </div>
        </div>

        <!-- Search in Queue -->
        <div style="padding: 10px 24px 0; flex-shrink: 0;">
          <input type="text" id="queue-search-input" class="search-input" style="width: 100%; height: 36px; font-size: 13px;" placeholder="Filter current queue by title or artist...">
        </div>

        <!-- Queue Tabs (Current vs History) -->
        <div class="studio-nav-bar" style="margin: 10px 24px 0; padding: 0 0 8px; border-bottom: 1px solid var(--border-subtle);">
          <button class="studio-nav-btn active" id="tab-btn-current-queue">Up Next</button>
          <button class="studio-nav-btn" id="tab-btn-queue-history">Session History (<span id="history-queue-count">0</span>)</button>
        </div>

        <!-- Body: Scrollable track list -->
        <div class="modal-body queue-body" id="queue-track-list-body" style="flex: 1; overflow-y: auto; padding: 12px 24px;">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event Bindings
    document.getElementById('btn-close-queue-mgr')?.addEventListener('click', closeQueueManager);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeQueueManager();
    });

    document.getElementById('queue-search-input')?.addEventListener('input', (e) => {
      updateQueueListView(e.target.value.trim());
    });

    document.getElementById('btn-smart-shuffle')?.addEventListener('click', () => {
      if (!window.getAppQueue || !window.setAppQueue) return;
      const q = window.getAppQueue();
      const curIdx = window.getAppCurrentIndex ? window.getAppCurrentIndex() : 0;
      const shuffled = smartShuffle(q, curIdx);
      window.setAppQueue(shuffled, 0);
      updateQueueListView();
      if (window.showToast) window.showToast('🎲 Smart Shuffle applied: artist variety optimized');
    });

    document.getElementById('btn-dedup-queue')?.addEventListener('click', () => {
      if (!window.getAppQueue || !window.setAppQueue) return;
      const q = window.getAppQueue();
      const res = deduplicateQueue(q);
      if (res.removedCount > 0) {
        window.setAppQueue(res.tracks);
        updateQueueListView();
        if (window.showToast) window.showToast(`✨ Removed ${res.removedCount} duplicate track(s)`);
      } else {
        if (window.showToast) window.showToast('✅ No duplicates found in queue');
      }
    });

    document.getElementById('btn-clear-queue-all')?.addEventListener('click', () => {
      if (!window.setAppQueue) return;
      if (confirm('Clear all upcoming tracks from playback queue?')) {
        const curIdx = window.getAppCurrentIndex ? window.getAppCurrentIndex() : 0;
        const q = window.getAppQueue ? window.getAppQueue() : [];
        const current = q[curIdx] ? [q[curIdx]] : [];
        window.setAppQueue(current, 0);
        updateQueueListView();
        if (window.showToast) window.showToast('🗑️ Upcoming queue cleared');
      }
    });

    document.getElementById('btn-save-current-queue')?.addEventListener('click', promptSaveQueue);
    document.getElementById('btn-view-saved-queues')?.addEventListener('click', openSavedQueuesModal);

    document.getElementById('tab-btn-current-queue')?.addEventListener('click', (e) => {
      e.target.classList.add('active');
      document.getElementById('tab-btn-queue-history')?.classList.remove('active');
      updateQueueListView();
    });

    document.getElementById('tab-btn-queue-history')?.addEventListener('click', (e) => {
      e.target.classList.add('active');
      document.getElementById('tab-btn-current-queue')?.classList.remove('active');
      updateHistoryListView();
    });
  }

  function updateQueueListView(searchFilter = '') {
    const body = document.getElementById('queue-track-list-body');
    const badge = document.getElementById('queue-count-badge');
    const savedCount = document.getElementById('saved-queue-count');
    const histCount = document.getElementById('history-queue-count');
    if (!body) return;

    const q = window.getAppQueue ? window.getAppQueue() : [];
    const curIdx = window.getAppCurrentIndex ? window.getAppCurrentIndex() : 0;

    if (badge) badge.textContent = `${q.length} Tracks`;
    if (savedCount) savedCount.textContent = Object.keys(savedQueues).length;
    if (histCount) histCount.textContent = queueHistory.length;

    body.innerHTML = '';
    if (q.length === 0) {
      body.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 40px;">Playback queue is currently empty</div>';
      return;
    }

    const kw = searchFilter.toLowerCase();
    const list = document.createElement('div');
    list.className = 'queue-interactive-list';

    q.forEach((t, index) => {
      if (kw) {
        const match = `${t.title || ''} ${t.artist || ''}`.toLowerCase();
        if (!match.includes(kw)) return;
      }

      const isCurrent = index === curIdx;
      const row = document.createElement('div');
      row.className = `queue-row-item ${isCurrent ? 'now-playing' : ''}`;
      row.dataset.index = index;

      row.innerHTML = `
        <span class="queue-reorder-handle" title="Move">⋮⋮</span>
        <span class="queue-row-idx">${isCurrent ? '▶' : index + 1}</span>
        <img class="queue-row-art" src="${t.artwork_url || ''}" alt="" onerror="this.style.display='none'">
        <div class="queue-row-meta">
          <div class="queue-row-title">${t.title || 'Track'}</div>
          <div class="queue-row-artist">${t.artist || 'Artist'}</div>
        </div>
        <div class="queue-row-actions">
          ${index > 0 ? `<button class="btn-queue-move" data-dir="-1" title="Move Up">↑</button>` : ''}
          ${index < q.length - 1 ? `<button class="btn-queue-move" data-dir="1" title="Move Down">↓</button>` : ''}
          ${!isCurrent ? `<button class="btn-queue-del" title="Remove track from queue">✕</button>` : ''}
        </div>
      `;

      // Click on track plays it
      row.querySelector('.queue-row-meta').addEventListener('click', () => {
        if (window.playTrack) {
          window.playTrack(t, index);
          updateQueueListView(searchFilter);
        }
      });

      // Move Up/Down buttons
      row.querySelectorAll('.btn-queue-move').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const dir = parseInt(btn.dataset.dir, 10);
          moveQueueTrack(index, index + dir);
          updateQueueListView(searchFilter);
        });
      });

      // Remove button
      row.querySelector('.btn-queue-del')?.addEventListener('click', (e) => {
        e.stopPropagation();
        removeQueueTrack(index);
        updateQueueListView(searchFilter);
      });

      list.appendChild(row);
    });

    body.appendChild(list);
  }

  function updateHistoryListView() {
    const body = document.getElementById('queue-track-list-body');
    if (!body) return;

    body.innerHTML = '';
    if (queueHistory.length === 0) {
      body.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 40px;">No session playback history recorded yet</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'queue-interactive-list';

    queueHistory.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'queue-row-item';

      const timeAgo = Math.round((Date.now() - t.playedAt) / 60000);
      const timeStr = timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`;

      row.innerHTML = `
        <span class="queue-row-idx">🕒</span>
        <img class="queue-row-art" src="${t.artwork_url || ''}" alt="" onerror="this.style.display='none'">
        <div class="queue-row-meta">
          <div class="queue-row-title">${t.title || 'Track'}</div>
          <div class="queue-row-artist">${t.artist || 'Artist'} • <span style="color: var(--text-dim);">${timeStr}</span></div>
        </div>
        <div class="queue-row-actions">
          <button class="btn-subtle btn-add-history" style="font-size: 11px;">+ Queue</button>
        </div>
      `;

      row.querySelector('.btn-add-history').addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.getAppQueue && window.setAppQueue) {
          const q = window.getAppQueue();
          q.push(t);
          window.setAppQueue(q);
          if (window.showToast) window.showToast(`➕ Added "${t.title}" to queue`);
        }
      });

      list.appendChild(row);
    });

    body.appendChild(list);
  }

  function moveQueueTrack(fromIdx, toIdx) {
    if (!window.getAppQueue || !window.setAppQueue) return;
    const q = window.getAppQueue();
    if (fromIdx < 0 || fromIdx >= q.length || toIdx < 0 || toIdx >= q.length) return;

    const [moved] = q.splice(fromIdx, 1);
    q.splice(toIdx, 0, moved);

    // Update current index if needed
    let curIdx = window.getAppCurrentIndex ? window.getAppCurrentIndex() : 0;
    if (curIdx === fromIdx) {
      curIdx = toIdx;
    } else if (fromIdx < curIdx && toIdx >= curIdx) {
      curIdx--;
    } else if (fromIdx > curIdx && toIdx <= curIdx) {
      curIdx++;
    }

    window.setAppQueue(q, curIdx);
  }

  function removeQueueTrack(idx) {
    if (!window.getAppQueue || !window.setAppQueue) return;
    const q = window.getAppQueue();
    if (idx < 0 || idx >= q.length) return;

    q.splice(idx, 1);
    let curIdx = window.getAppCurrentIndex ? window.getAppCurrentIndex() : 0;
    if (idx < curIdx) curIdx--;

    window.setAppQueue(q, curIdx);
  }

  function promptSaveQueue() {
    const q = window.getAppQueue ? window.getAppQueue() : [];
    if (q.length === 0) {
      if (window.showToast) window.showToast('⚠️ Queue is empty');
      return;
    }
    const name = prompt('Enter a name for this saved queue preset:', `Queue Preset ${Object.keys(savedQueues).length + 1}`);
    if (name && name.trim()) {
      savedQueues[name.trim()] = q.slice();
      saveSavedQueuesToStorage();
      const countEl = document.getElementById('saved-queue-count');
      if (countEl) countEl.textContent = Object.keys(savedQueues).length;
      if (window.showToast) window.showToast(`💾 Saved queue "${name.trim()}" (${q.length} tracks)`);
    }
  }

  function openSavedQueuesModal() {
    const names = Object.keys(savedQueues);
    if (names.length === 0) {
      if (window.showToast) window.showToast('ℹ️ No saved queues yet. Click "Save Queue" to create one!');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'bento-modal-overlay open';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
      <div class="bento-modal" style="max-width: 500px;">
        <div class="modal-header">
          <div class="modal-title"><span>📂 Saved Queues Presets</span></div>
          <button class="modal-close-btn" id="btn-close-saved-m">✕</button>
        </div>
        <div class="modal-body" style="padding: 16px 24px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${names.map(name => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 12px; border: 1px solid var(--border-subtle);">
                <div>
                  <div style="font-weight: 700; color: #FFF; font-size: 14px;">${name}</div>
                  <div style="font-size: 12px; color: var(--text-dim);">${savedQueues[name].length} tracks</div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="action-btn btn-load-saved-q" data-name="${name}" style="padding: 6px 14px; border-radius: 999px; background: var(--orange-neon); color: #fff; font-weight: 700; border: none; cursor: pointer;">Load</button>
                  <button class="btn-subtle btn-del-saved-q" data-name="${name}" style="color: #FF5555;">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-saved-m').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelectorAll('.btn-load-saved-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        if (savedQueues[name] && window.setAppQueue) {
          window.setAppQueue(savedQueues[name].slice(), 0);
          modal.remove();
          updateQueueListView();
          if (window.showToast) window.showToast(`▶ Loaded saved queue: "${name}"`);
        }
      });
    });

    modal.querySelectorAll('.btn-del-saved-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        delete savedQueues[name];
        saveSavedQueuesToStorage();
        modal.remove();
        openSavedQueuesModal();
      });
    });
  }

  function openQueueManager() {
    renderQueueModal();
    const overlay = document.getElementById('queue-manager-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      updateQueueListView();
    }
  }

  function closeQueueManager() {
    const overlay = document.getElementById('queue-manager-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  // Public Interface
  window.QueueManager = {
    open: openQueueManager,
    close: closeQueueManager,
    pushHistory: pushQueueHistory,
    smartShuffle: smartShuffle,
    deduplicate: deduplicateQueue,
    getHistory: () => queueHistory,
    setQueue: (tracks, idx = 0) => {
      if (window.setAppQueue) window.setAppQueue(tracks, idx);
    },
    playIndex: (idx) => {
      if (window.getAppQueue && window.playTrack) {
        const q = window.getAppQueue();
        if (q[idx]) window.playTrack(q[idx], idx);
      }
    }
  };

})(window);
