/**
 * SoundCloud Ultimate — Advanced Queue Manager
 * Phase 8: Drag-and-Drop Reordering, Saved Queues, Deduplication, Smart Shuffle & History
 */
(function(window) {
  'use strict';

  const STORAGE_SAVED_QUEUES = 'sc_saved_queues_v1';

  let savedQueues = loadSavedQueues();
  let queueHistory = [];

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function formatDuration(t) {
    const ms = t.duration_ms || (t.duration && t.duration > 1000 ? t.duration : (t.duration || 0) * 1000);
    if (!ms) return '';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

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
    overlay.className = 'queue-manager-modal-overlay';

    overlay.innerHTML = `
      <div class="queue-manager-modal" role="dialog" aria-modal="true" aria-label="Playback Queue">
        <!-- Header -->
        <div class="queue-modal-header">
          <div class="queue-modal-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Playback Queue</span>
            <span class="queue-count-pill" id="queue-count-badge">0 tracks</span>
          </div>
          <button class="queue-modal-close-btn" id="btn-close-queue-mgr" title="Close Queue (Esc)">&times;</button>
        </div>

        <!-- Toolbar -->
        <div class="queue-toolbar">
          <div class="queue-toolbar-group">
            <button class="queue-flat-btn" id="btn-smart-shuffle" title="Smart Shuffle: avoids repeating same artist consecutively">Smart Shuffle</button>
            <button class="queue-flat-btn" id="btn-dedup-queue" title="Detect & Remove duplicates">Deduplicate</button>
            <button class="queue-flat-btn" id="btn-save-current-queue" title="Save queue preset">Save Queue</button>
            <button class="queue-flat-btn" id="btn-view-saved-queues" title="View saved presets">Saved Presets (<span id="saved-queue-count">0</span>)</button>
          </div>
          <div class="queue-toolbar-group">
            <button class="queue-flat-btn queue-btn-danger" id="btn-clear-queue-all" title="Clear upcoming tracks from queue">Clear</button>
          </div>
        </div>

        <!-- Search in Queue -->
        <div class="queue-filter-wrap">
          <svg viewBox="0 0 24 24" class="queue-filter-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="queue-search-input" class="queue-filter-input" placeholder="Filter current queue by title or artist...">
        </div>

        <!-- Queue Tabs (Current vs History) -->
        <div class="queue-tabs-bar">
          <button class="queue-tab-btn active" id="tab-btn-current-queue">Up Next</button>
          <button class="queue-tab-btn" id="tab-btn-queue-history">Session History (<span id="history-queue-count">0</span>)</button>
        </div>

        <!-- Body: Scrollable track list -->
        <div class="queue-body" id="queue-track-list-body">
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
      if (window.showToast) window.showToast('Smart Shuffle applied: artist variety optimized');
    });

    document.getElementById('btn-dedup-queue')?.addEventListener('click', () => {
      if (!window.getAppQueue || !window.setAppQueue) return;
      const q = window.getAppQueue();
      const res = deduplicateQueue(q);
      if (res.removedCount > 0) {
        window.setAppQueue(res.tracks);
        updateQueueListView();
        if (window.showToast) window.showToast(`Removed ${res.removedCount} duplicate track(s)`);
      } else {
        if (window.showToast) window.showToast('No duplicates found in queue');
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
        if (window.showToast) window.showToast('Upcoming queue cleared');
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

    if (badge) badge.textContent = `${q.length} tracks`;
    if (savedCount) savedCount.textContent = Object.keys(savedQueues).length;
    if (histCount) histCount.textContent = queueHistory.length;

    body.innerHTML = '';
    if (q.length === 0) {
      body.innerHTML = '<div style="color: var(--text-dim, #71717A); text-align: center; padding: 40px; font-size: 13px;">Playback queue is currently empty</div>';
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
        <span class="queue-row-idx">${isCurrent ? '▶' : index + 1}</span>
        <img class="queue-row-art" src="${escapeHtml(t.artwork_url || 'assets/default_artwork.png')}" alt="" onerror="this.src='assets/default_artwork.png'">
        <div class="queue-row-meta">
          <div class="queue-row-title" title="${escapeHtml(t.title || 'Track')}">${escapeHtml(t.title || 'Track')}</div>
          <div class="queue-row-artist" title="${escapeHtml(t.artist || 'Artist')}">${escapeHtml(t.artist || 'Artist')}</div>
        </div>
        <div class="queue-row-duration">${formatDuration(t)}</div>
        <div class="queue-row-actions">
          ${index > 0 ? `<button class="btn-queue-move" data-dir="-1" title="Move Up">↑</button>` : ''}
          ${index < q.length - 1 ? `<button class="btn-queue-move" data-dir="1" title="Move Down">↓</button>` : ''}
          ${!isCurrent ? `<button class="btn-queue-del" title="Remove track from queue">&times;</button>` : ''}
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
      body.innerHTML = '<div style="color: var(--text-dim, #71717A); text-align: center; padding: 40px; font-size: 13px;">No session playback history recorded yet</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'queue-interactive-list';

    queueHistory.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'queue-row-item';

      const timeAgo = Math.round((Date.now() - t.playedAt) / 60000);
      const timeStr = timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`;

      row.innerHTML = `
        <span class="queue-row-idx"></span>
        <img class="queue-row-art" src="${escapeHtml(t.artwork_url || 'assets/default_artwork.png')}" alt="" onerror="this.src='assets/default_artwork.png'">
        <div class="queue-row-meta">
          <div class="queue-row-title" title="${escapeHtml(t.title || 'Track')}">${escapeHtml(t.title || 'Track')}</div>
          <div class="queue-row-artist" title="${escapeHtml(t.artist || 'Artist')}">${escapeHtml(t.artist || 'Artist')} • <span style="color: var(--text-dim, #71717A);">${timeStr}</span></div>
        </div>
        <div class="queue-row-duration">${formatDuration(t)}</div>
        <div class="queue-row-actions">
          <button class="queue-flat-btn btn-add-history" style="font-size: 11px; padding: 4px 10px;">+ Queue</button>
        </div>
      `;

      row.querySelector('.btn-add-history').addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.getAppQueue && window.setAppQueue) {
          const q = window.getAppQueue();
          q.push(t);
          window.setAppQueue(q);
          if (window.showToast) window.showToast(`Added "${t.title}" to queue`);
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
      if (window.showToast) window.showToast('Queue is empty');
      return;
    }
    const name = prompt('Enter a name for this saved queue preset:', `Queue Preset ${Object.keys(savedQueues).length + 1}`);
    if (name && name.trim()) {
      savedQueues[name.trim()] = q.slice();
      saveSavedQueuesToStorage();
      const countEl = document.getElementById('saved-queue-count');
      if (countEl) countEl.textContent = Object.keys(savedQueues).length;
      if (window.showToast) window.showToast(`Saved queue "${name.trim()}" (${q.length} tracks)`);
    }
  }

  function openSavedQueuesModal() {
    const names = Object.keys(savedQueues);
    if (names.length === 0) {
      if (window.showToast) window.showToast('No saved queues yet. Click "Save Queue" to create one!');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'queue-manager-modal-overlay open';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
      <div class="queue-manager-modal" style="max-width: 500px; height: auto; max-height: 80vh;">
        <div class="queue-modal-header">
          <div class="queue-modal-title"><span>Saved Queue Presets</span></div>
          <button class="queue-modal-close-btn" id="btn-close-saved-m">&times;</button>
        </div>
        <div class="queue-body" style="padding: 16px 20px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${names.map(name => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #181B22; border-radius: 8px; border: 1px solid #262A34;">
                <div>
                  <div style="font-weight: 600; color: #F3F4F6; font-size: 13px;">${escapeHtml(name)}</div>
                  <div style="font-size: 11.5px; color: #9CA3AF;">${savedQueues[name].length} tracks</div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="queue-flat-btn btn-load-saved-q" data-name="${escapeHtml(name)}" style="background: #FF5500; color: #FFFFFF; border-color: #FF5500; font-weight: 600;">Load</button>
                  <button class="queue-flat-btn queue-btn-danger btn-del-saved-q" data-name="${escapeHtml(name)}">Delete</button>
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
          if (window.showToast) window.showToast(`Loaded saved queue: "${name}"`);
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
      const searchInp = document.getElementById('queue-search-input');
      if (searchInp) searchInp.value = '';
      updateQueueListView();
    }
  }

  function closeQueueManager() {
    const overlay = document.getElementById('queue-manager-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  // Global Escape key listener to close queue manager
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('queue-manager-modal-overlay');
      if (overlay && overlay.classList.contains('open')) {
        closeQueueManager();
      }
    }
  });

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
