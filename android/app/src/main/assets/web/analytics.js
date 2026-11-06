/**
 * SoundCloud Ultimate — Personal Music Analytics & Listening Statistics
 * Phase 4: Local Playback Event Tracking, Interactive Charts, CSV/JSON Export & Wrapped Report
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'sc_listening_analytics_v1';
  const CONFIG_KEY = 'sc_analytics_config_v1';

  let config = loadConfig();
  let events = loadEvents();

  function loadConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { enabled: true };
  }

  function saveConfig() {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (_) {}
  }

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  }

  function saveEvents() {
    try {
      // Keep last 5000 events to maintain lightweight local storage footprint
      if (events.length > 5000) {
        events = events.slice(events.length - 5000);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (_) {}
  }

  // Record playback event
  function recordPlaybackEvent(track, listenDurationSec) {
    if (!config.enabled || !track || !track.id) return;
    if (listenDurationSec < 10) return; // Skip trivial skips under 10 seconds

    const ev = {
      id: track.id,
      title: track.title || 'Untitled Track',
      artist: track.artist || 'Unknown Artist',
      artwork_url: track.artwork_url || '',
      duration_ms: track.duration_ms || 0,
      listened_sec: Math.round(listenDurationSec),
      genre: track.genre || '',
      timestamp: Date.now()
    };

    events.push(ev);
    saveEvents();
  }

  // Compute Aggregated Statistics
  function getAnalyticsMetrics(filterDays = 0) {
    const now = Date.now();
    const cutoff = filterDays > 0 ? now - (filterDays * 86400000) : 0;
    const filtered = events.filter(e => e.timestamp >= cutoff);

    const totalSeconds = filtered.reduce((acc, e) => acc + (e.listened_sec || 0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const totalTracks = filtered.length;

    // Artists Aggregation
    const artistMap = {};
    const trackMap = {};
    const hourMap = new Array(24).fill(0);
    const dayMap = new Array(7).fill(0); // 0 = Sun, 1 = Mon ...
    const dateSet = new Set();

    filtered.forEach(e => {
      // Artist
      const artist = e.artist || 'Unknown Artist';
      if (!artistMap[artist]) {
        artistMap[artist] = { name: artist, count: 0, seconds: 0, artwork: e.artwork_url };
      }
      artistMap[artist].count++;
      artistMap[artist].seconds += e.listened_sec || 0;

      // Track
      const trackKey = `${e.id}`;
      if (!trackMap[trackKey]) {
        trackMap[trackKey] = {
          id: e.id,
          title: e.title,
          artist: e.artist,
          artwork_url: e.artwork_url,
          count: 0,
          seconds: 0,
          lastPlayed: e.timestamp
        };
      }
      trackMap[trackKey].count++;
      trackMap[trackKey].seconds += e.listened_sec || 0;
      if (e.timestamp > trackMap[trackKey].lastPlayed) {
        trackMap[trackKey].lastPlayed = e.timestamp;
      }

      // Time distribution
      const d = new Date(e.timestamp);
      hourMap[d.getHours()]++;
      dayMap[d.getDay()]++;
      dateSet.add(d.toISOString().slice(0, 10));
    });

    const topArtists = Object.values(artistMap).sort((a, b) => b.seconds - a.seconds).slice(0, 10);
    const topTracks = Object.values(trackMap).sort((a, b) => b.count - a.count).slice(0, 10);

    // Calculate Streak
    const streak = computeStreak(dateSet);

    return {
      totalHours,
      totalSeconds,
      totalTracks,
      topArtists,
      topTracks,
      hourMap,
      dayMap,
      streak,
      daysTracked: dateSet.size
    };
  }

  function computeStreak(dateSet) {
    if (dateSet.size === 0) return 0;
    let streak = 0;
    const now = new Date();
    let current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    while (true) {
      const dateStr = current.toISOString().slice(0, 10);
      if (dateSet.has(dateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        // If today hasn't happened yet, check yesterday
        if (streak === 0) {
          current.setDate(current.getDate() - 1);
          const yesterdayStr = current.toISOString().slice(0, 10);
          if (dateSet.has(yesterdayStr)) {
            streak++;
            current.setDate(current.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  }

  // Render SVG Activity Chart
  function renderActivityChartSvg(hourMap) {
    const maxVal = Math.max(...hourMap, 1);
    const width = 560;
    const height = 140;
    const padding = 28;
    const barWidth = (width - padding * 2) / 24;

    let bars = '';
    hourMap.forEach((val, i) => {
      const barH = Math.round((val / maxVal) * (height - 45));
      const x = padding + i * barWidth + 3;
      const y = height - padding - barH;
      const activeColor = 'var(--orange-neon, #FF5500)';
      const isPeak = val === maxVal && val > 0;

      bars += `
        <rect x="${x}" y="${y}" width="${barWidth - 6}" height="${barH}" rx="3" 
              fill="${isPeak ? activeColor : 'rgba(255,255,255,0.15)'}" 
              opacity="${val > 0 ? '0.9' : '0.2'}">
          <title>${i}:00 - ${i}:59: ${val} plays</title>
        </rect>
        ${i % 4 === 0 ? `<text x="${x + 2}" y="${height - 8}" fill="var(--text-dim, #686868)" font-size="9" text-anchor="middle">${i}h</text>` : ''}
      `;
    });

    return `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        ${bars}
      </svg>
    `;
  }

  // Render Analytics Modal
  function renderAnalyticsModal() {
    let overlay = document.getElementById('analytics-modal-overlay');
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'analytics-modal-overlay';
    overlay.className = 'bento-modal-overlay';

    overlay.innerHTML = `
      <div class="bento-modal analytics-modal" style="max-width: 780px;">
        <div class="modal-header">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <span>Listening Statistics & Analytics</span>
            <span class="studio-badge" id="stats-streak-badge">⚡ 0 Day Streak</span>
          </div>
          <button class="modal-close-btn" id="btn-close-analytics">✕</button>
        </div>

        <!-- Filter Bar -->
        <div class="analytics-filter-bar">
          <div class="segmented-control" id="control-analytics-range">
            <button class="seg-btn active" data-days="0">All Time</button>
            <button class="seg-btn" data-days="30">Last 30 Days</button>
            <button class="seg-btn" data-days="7">Last 7 Days</button>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-subtle" id="btn-export-csv" title="Download CSV spreadsheet">📊 Export CSV</button>
            <button class="btn-subtle" id="btn-export-json" title="Download JSON data">💾 Export JSON</button>
            <button class="btn-subtle" id="btn-wrapped" style="color: var(--orange-neon); font-weight: 700;">🎁 Wrapped Card</button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body analytics-body" id="analytics-body-content">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event binding
    document.getElementById('btn-close-analytics')?.addEventListener('click', closeAnalytics);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAnalytics();
    });

    overlay.querySelectorAll('#control-analytics-range .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('#control-analytics-range .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const days = parseInt(btn.dataset.days, 10);
        updateAnalyticsView(days);
      });
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', exportCsv);
    document.getElementById('btn-export-json')?.addEventListener('click', exportJson);
    document.getElementById('btn-wrapped')?.addEventListener('click', generateWrappedReport);
  }

  function updateAnalyticsView(filterDays = 0) {
    const body = document.getElementById('analytics-body-content');
    if (!body) return;

    const metrics = getAnalyticsMetrics(filterDays);
    const badge = document.getElementById('stats-streak-badge');
    if (badge) {
      badge.textContent = `🔥 ${metrics.streak} Day Streak`;
    }

    body.innerHTML = `
      <!-- Top Metrics Bento Grid -->
      <div class="analytics-stats-bento">
        <div class="metric-card">
          <div class="metric-label">Listening Time</div>
          <div class="metric-value">${metrics.totalHours}<span class="metric-unit">hrs</span></div>
          <div class="metric-sub">${Math.round(metrics.totalSeconds / 60)} minutes total</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tracks Played</div>
          <div class="metric-value">${metrics.totalTracks}</div>
          <div class="metric-sub">${metrics.daysTracked} active listening days</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Top Artist</div>
          <div class="metric-value" style="font-size: 18px; line-height: 1.3;">${metrics.topArtists[0] ? metrics.topArtists[0].name : '—'}</div>
          <div class="metric-sub">${metrics.topArtists[0] ? metrics.topArtists[0].count + ' plays' : 'No data yet'}</div>
        </div>
      </div>

      <!-- Activity Graph Card -->
      <div class="analytics-card" style="margin-top: 14px;">
        <div class="analytics-card-title">🕒 Listening Activity by Hour of Day</div>
        <div class="chart-container" style="padding-top: 10px;">
          ${renderActivityChartSvg(metrics.hourMap)}
        </div>
      </div>

      <!-- Top Artists and Tracks Grids -->
      <div class="analytics-columns-grid" style="margin-top: 14px;">
        <!-- Top Artists -->
        <div class="analytics-card">
          <div class="analytics-card-title">🎤 Top Artists</div>
          <div class="rankings-list">
            ${metrics.topArtists.length === 0 ? '<div style="color: var(--text-dim); padding: 16px; font-size: 13px;">Play tracks to discover your top artists</div>' : ''}
            ${metrics.topArtists.map((a, idx) => `
              <div class="ranking-item">
                <span class="ranking-num">${idx + 1}</span>
                <span class="ranking-name" title="${a.name}">${a.name}</span>
                <span class="ranking-stat">${Math.round(a.seconds / 60)}m (${a.count})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Top Tracks -->
        <div class="analytics-card">
          <div class="analytics-card-title">🎵 Top Tracks</div>
          <div class="rankings-list">
            ${metrics.topTracks.length === 0 ? '<div style="color: var(--text-dim); padding: 16px; font-size: 13px;">Play tracks to generate your leaderboard</div>' : ''}
            ${metrics.topTracks.map((t, idx) => `
              <div class="ranking-item">
                <span class="ranking-num">${idx + 1}</span>
                <span class="ranking-name" title="${t.title}">${t.title}</span>
                <span class="ranking-stat">${t.count} plays</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Privacy & Management Footer -->
      <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-dim); cursor: pointer;">
          <input type="checkbox" id="chk-toggle-analytics" ${config.enabled ? 'checked' : ''}>
          <span>Enable local listening analytics</span>
        </label>
        <button class="btn-subtle" id="btn-clear-analytics" style="color: #FF5555; font-size: 11px;">
          🗑️ Clear All Statistics
        </button>
      </div>
    `;

    // Dynamic bindings inside body
    document.getElementById('chk-toggle-analytics')?.addEventListener('change', (e) => {
      config.enabled = e.target.checked;
      saveConfig();
      if (window.showToast) window.showToast(config.enabled ? '📊 Analytics Tracking Enabled' : '⏸️ Analytics Tracking Paused');
    });

    document.getElementById('btn-clear-analytics')?.addEventListener('click', () => {
      if (confirm('Permanently wipe all locally recorded listening statistics?')) {
        events = [];
        saveEvents();
        updateAnalyticsView(filterDays);
        if (window.showToast) window.showToast('🗑️ All Listening Analytics Cleared');
      }
    });
  }

  function openAnalytics() {
    renderAnalyticsModal();
    const overlay = document.getElementById('analytics-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      updateAnalyticsView(0);
    }
  }

  function closeAnalytics() {
    const overlay = document.getElementById('analytics-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function exportCsv() {
    if (events.length === 0) {
      if (window.showToast) window.showToast('⚠️ No listening data to export yet');
      return;
    }
    const headers = ['Track ID', 'Title', 'Artist', 'Duration (ms)', 'Listened (sec)', 'Genre', 'Date/Time'];
    const rows = events.map(e => [
      e.id,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.artist || '').replace(/"/g, '""')}"`,
      e.duration_ms || 0,
      e.listened_sec || 0,
      `"${(e.genre || '').replace(/"/g, '""')}"`,
      new Date(e.timestamp).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `soundcloud-ultimate-analytics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (window.showToast) window.showToast('📊 CSV Export Downloaded');
  }

  function exportJson() {
    if (events.length === 0) {
      if (window.showToast) window.showToast('⚠️ No listening data to export yet');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `soundcloud-ultimate-analytics-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (window.showToast) window.showToast('💾 JSON Analytics Export Downloaded');
  }

  function generateWrappedReport() {
    const metrics = getAnalyticsMetrics(0);
    const topArtist = metrics.topArtists[0] ? metrics.topArtists[0].name : 'SoundCloud Explorer';
    const topTrack = metrics.topTracks[0] ? metrics.topTracks[0].title : 'Eclectic Soundscapes';

    const modal = document.createElement('div');
    modal.className = 'bento-modal-overlay open';
    modal.style.zIndex = '99999';
    modal.innerHTML = `
      <div class="bento-modal wrapped-card-modal" style="max-width: 480px; text-align: center; background: #0E0D14; border: 1px solid var(--orange-neon); box-shadow: 0 0 50px rgba(255,85,0,0.3);">
        <div style="font-size: 32px; margin-bottom: 8px;">🎁</div>
        <div style="font-size: 20px; font-weight: 800; color: #FFF; letter-spacing: 0.5px;">YOUR SOUNDCLOUD WRAPPED</div>
        <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 24px;">Personal Music Telemetry & Taste Report</div>

        <div style="background: rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">Top Artist</div>
          <div style="font-size: 22px; font-weight: 800; color: var(--orange-neon); margin: 4px 0 16px;">${topArtist}</div>

          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">Most Played Track</div>
          <div style="font-size: 16px; font-weight: 700; color: #FFF; margin: 4px 0 16px;">${topTrack}</div>

          <div style="display: flex; justify-content: space-around; margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
            <div>
              <div style="font-size: 20px; font-weight: 800; color: #FFF;">${metrics.totalHours}h</div>
              <div style="font-size: 11px; color: var(--text-dim);">Listening Time</div>
            </div>
            <div>
              <div style="font-size: 20px; font-weight: 800; color: #FFF;">${metrics.totalTracks}</div>
              <div style="font-size: 11px; color: var(--text-dim);">Tracks Played</div>
            </div>
            <div>
              <div style="font-size: 20px; font-weight: 800; color: #FFF;">${metrics.streak}d</div>
              <div style="font-size: 11px; color: var(--text-dim);">Streak</div>
            </div>
          </div>
        </div>

        <button class="action-btn" id="btn-close-wrapped" style="width: 100%; padding: 12px; border-radius: 999px; background: var(--orange-neon); color: #FFF; font-weight: 700; border: none; cursor: pointer;">
          Close Wrapped Summary
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#btn-close-wrapped').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // Public Interface
  window.ListeningAnalytics = {
    recordEvent: recordPlaybackEvent,
    getMetrics: getAnalyticsMetrics,
    open: openAnalytics,
    close: closeAnalytics,
    exportCsv: exportCsv,
    exportJson: exportJson
  };

})(window);
