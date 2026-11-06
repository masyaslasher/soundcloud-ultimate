/**
 * SoundCloud Ultimate — Track Inspector Module
 * Deep technical inspection of track metadata, transcodings, stream diagnostics, and raw payload.
 */

(function () {
  'use strict';

  let currentTrack = null;
  let activeTab = 'meta';

  function formatNumber(num) {
    if (!num && num !== 0) return '—';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  function formatDuration(ms) {
    if (!ms) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return isoStr;
    }
  }

  function copyToClipboard(text, successMsg) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) {
        window.showToast(successMsg || 'Copied to clipboard!', 'info');
      } else {
        alert(successMsg || 'Copied!');
      }
    }).catch(err => {
      console.warn('Clipboard write error:', err);
    });
  }

  function inspect(track) {
    if (!track) {
      if (typeof window.getCurrentTrack === 'function') {
        track = window.getCurrentTrack();
      }
    }
    if (!track) {
      if (window.showToast) window.showToast('No active track to inspect', 'warning');
      return;
    }
    currentTrack = track;
    ensureModal();
    renderContent();
    const modal = document.getElementById('track-inspector-modal');
    if (modal) {
      modal.classList.add('visible');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function close() {
    const modal = document.getElementById('track-inspector-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function ensureModal() {
    if (document.getElementById('track-inspector-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'track-inspector-modal';
    modal.className = 'sc-modal-overlay';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="sc-modal-container sc-inspector-box">
        <div class="sc-modal-header">
          <div class="sc-inspector-title-group">
            <span class="sc-inspector-badge">TRACK INSPECTOR</span>
            <h3 id="inspector-title" class="sc-inspector-main-title">Track Details</h3>
          </div>
          <button class="sc-modal-close" id="btn-inspector-close" aria-label="Close">&times;</button>
        </div>

        <div class="sc-inspector-tabs">
          <button class="sc-tab-btn active" data-tab="meta">Metadata</button>
          <button class="sc-tab-btn" data-tab="audio">Audio Diagnostics</button>
          <button class="sc-tab-btn" data-tab="json">Raw JSON</button>
        </div>

        <div class="sc-inspector-body" id="inspector-body">
          <!-- Populated dynamically -->
        </div>

        <div class="sc-inspector-footer">
          <button class="btn-secondary" id="btn-inspect-copy-link">🔗 Copy Web Link</button>
          <button class="btn-secondary" id="btn-inspect-copy-stream">📡 Copy Stream URL</button>
          <button class="btn-primary" id="btn-inspect-queue">➕ Add to Queue</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector('#btn-inspector-close').addEventListener('click', close);

    const tabs = modal.querySelectorAll('.sc-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        renderContent();
      });
    });

    modal.querySelector('#btn-inspect-copy-link').addEventListener('click', () => {
      if (!currentTrack) return;
      const url = currentTrack.permalink_url || `https://soundcloud.com/${currentTrack.user ? currentTrack.user.permalink : 'track'}/${currentTrack.id}`;
      copyToClipboard(url, 'SoundCloud track link copied!');
    });

    modal.querySelector('#btn-inspect-copy-stream').addEventListener('click', () => {
      if (!currentTrack) return;
      const streamUrl = `/api/stream?id=${currentTrack.id}`;
      copyToClipboard(window.location.origin + streamUrl, 'Direct stream endpoint copied!');
    });

    modal.querySelector('#btn-inspect-queue').addEventListener('click', () => {
      if (!currentTrack) return;
      if (window.QueueManager && typeof window.QueueManager.addTrack === 'function') {
        window.QueueManager.addTrack(currentTrack);
      } else if (typeof window.addToQueue === 'function') {
        window.addToQueue(currentTrack);
      }
      close();
    });
  }

  function renderContent() {
    const body = document.getElementById('inspector-body');
    if (!body || !currentTrack) return;

    const titleEl = document.getElementById('inspector-title');
    if (titleEl) {
      titleEl.textContent = currentTrack.title || 'Untitled Track';
    }

    if (activeTab === 'meta') {
      renderMetadataTab(body);
    } else if (activeTab === 'audio') {
      renderAudioTab(body);
    } else if (activeTab === 'json') {
      renderJsonTab(body);
    }
  }

  function renderMetadataTab(body) {
    const t = currentTrack;
    const user = t.user || {};
    const artwork = t.artwork_url ? t.artwork_url.replace('-large', '-t500x500') : (t.user && t.user.avatar_url ? t.user.avatar_url : '');

    body.innerHTML = `
      <div class="sc-inspector-meta-grid">
        <div class="sc-inspector-artwork-col">
          <img src="${artwork || 'assets/default_artwork.png'}" alt="Artwork" class="sc-inspector-art-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'120\\' height=\\'120\\' fill=\\'%23333\\'><rect width=\\'120\\' height=\\'120\\'/></svg>'"/>
          <div class="sc-inspector-actions-sub">
            <span class="sc-tag-pill">${t.genre || 'Various Genres'}</span>
          </div>
        </div>

        <div class="sc-inspector-data-col">
          <table class="sc-inspector-table">
            <tbody>
              <tr>
                <td class="lbl">Track Title</td>
                <td class="val"><strong>${t.title || '—'}</strong></td>
              </tr>
              <tr>
                <td class="lbl">Artist / Creator</td>
                <td class="val">${user.username || 'Unknown Artist'} ${user.verified ? '✓' : ''}</td>
              </tr>
              <tr>
                <td class="lbl">Track ID</td>
                <td class="val"><code>${t.id || '—'}</code></td>
              </tr>
              <tr>
                <td class="lbl">Duration</td>
                <td class="val">${formatDuration(t.duration)} (${(t.duration ? (t.duration / 1000).toFixed(1) : 0)} s)</td>
              </tr>
              <tr>
                <td class="lbl">Release Date</td>
                <td class="val">${formatDate(t.release_date || t.created_at)}</td>
              </tr>
              <tr>
                <td class="lbl">Play Count</td>
                <td class="val">${formatNumber(t.playback_count)} plays</td>
              </tr>
              <tr>
                <td class="lbl">Likes</td>
                <td class="val">${formatNumber(t.likes_count || t.favoritings_count)}</td>
              </tr>
              <tr>
                <td class="lbl">Reposts</td>
                <td class="val">${formatNumber(t.reposts_count)}</td>
              </tr>
              <tr>
                <td class="lbl">License</td>
                <td class="val">${t.license || 'All Rights Reserved'}</td>
              </tr>
              <tr>
                <td class="lbl">Monetization</td>
                <td class="val">${t.monetization_model || 'standard'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAudioTab(body) {
    const t = currentTrack;
    const transcodings = (t.media && t.media.transcodings) ? t.media.transcodings : [];
    
    let transcodingsHtml = '';
    if (transcodings.length > 0) {
      transcodingsHtml = transcodings.map((tc, idx) => {
        const isHls = tc.format && tc.format.protocol === 'hls';
        const isMp3 = tc.format && tc.format.mime_type && tc.format.mime_type.includes('mpeg');
        const isOpus = tc.format && tc.format.mime_type && tc.format.mime_type.includes('ogg');
        const isAac = tc.format && tc.format.mime_type && tc.format.mime_type.includes('mp4');

        let formatBadge = 'MP3 128 kbps';
        if (isOpus) formatBadge = 'Opus HQ';
        if (isAac) formatBadge = 'AAC 256 kbps (HQ)';

        return `
          <div class="sc-transcoding-row ${idx === 0 ? 'preferred' : ''}">
            <div class="tc-info">
              <span class="tc-badge ${isHls ? 'hls' : 'prog'}">${isHls ? 'HLS Stream' : 'Progressive HTTP'}</span>
              <span class="tc-name">${tc.preset || tc.format.mime_type} &bull; ${formatBadge}</span>
            </div>
            <div class="tc-meta">
              <span class="tc-quality">${tc.quality || 'sq'}</span>
              <span class="tc-sni">${isHls ? 'Chunks proxied' : 'Direct'}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      transcodingsHtml = `<div class="empty-notice">Direct audio transcoding stream active via SoundCloud CDN / Anti-DPI proxy.</div>`;
    }

    body.innerHTML = `
      <div class="sc-audio-diag-panel">
        <div class="sc-diag-section">
          <h4>🔊 Active Audio Pipeline</h4>
          <div class="sc-diag-card">
            <div class="diag-item">
              <span class="d-label">Proxy Route:</span>
              <span class="d-val text-success">/api/media/stream (Anti-DPI Bypass Active)</span>
            </div>
            <div class="diag-item">
              <span class="d-label">WebAudio Node:</span>
              <span class="d-val">AnalyserNode (FFT Size 2048, 48 kHz / 16-bit Float)</span>
            </div>
            <div class="diag-item">
              <span class="d-label">Waveform Hash:</span>
              <span class="d-val"><code>${t.waveform_url ? t.waveform_url.split('/').pop().substring(0, 24) : 'Internal WebAudio peak analysis'}</code></span>
            </div>
            <div class="diag-item">
              <span class="d-label">Downloadable:</span>
              <span class="d-val">${t.downloadable ? 'Yes (Original Master File)' : 'Stream Only (Transcoded)'}</span>
            </div>
          </div>
        </div>

        <div class="sc-diag-section">
          <h4>📦 Transcoding Formats (${transcodings.length})</h4>
          <div class="sc-transcodings-list">
            ${transcodingsHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderJsonTab(body) {
    const rawStr = JSON.stringify(currentTrack, null, 2);
    body.innerHTML = `
      <div class="sc-json-viewer-wrap">
        <div class="sc-json-toolbar">
          <span>JSON Size: ${(rawStr.length / 1024).toFixed(1)} KB</span>
          <button class="btn-micro" id="btn-copy-raw-json">📋 Copy JSON</button>
        </div>
        <pre class="sc-json-pre"><code>${escapeHtml(rawStr)}</code></pre>
      </div>
    `;

    body.querySelector('#btn-copy-raw-json').addEventListener('click', () => {
      copyToClipboard(rawStr, 'Raw track JSON copied to clipboard!');
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  window.TrackInspector = {
    open: inspect,
    inspect: inspect,
    close: close
  };
})();
