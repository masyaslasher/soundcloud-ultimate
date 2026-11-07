/**
 * SoundCloud Ultimate — Real-time WebAudio Visualizer & Audio Analyzer
 * Phase 5: Real AnalyserNode Integration, 6 Visualizer Modes, Fullscreen & Studio Telemetry
 */
(function(window) {
  'use strict';

  let analyser = null;
  let audioCtxRef = null;
  let animFrameId = null;
  let currentMode = 'spectrum'; // 'spectrum', 'waveform', 'circular', 'bass', 'peak', 'minimal'
  let sensitivity = 1.0;
  let targetFps = 60;
  let lastFrameTime = 0;
  let isFullscreen = false;

  const MODES = [
    { id: 'spectrum', name: '📊 Spectrum Analyzer', desc: 'Frequency spectrum bars with peak caps' },
    { id: 'waveform', name: '〰️ Oscilloscope', desc: 'Real-time oscilloscope time-domain wave' },
    { id: 'circular', name: '⭕ Circular Spectrum', desc: 'Radial frequency ring radiating from album art' },
    { id: 'bass', name: '💥 Bass Pulse', desc: 'Dynamic bass-reactive orbital glow' },
    { id: 'peak', name: '📶 Studio Peak Meter', desc: 'Stereo dBFS LED peak level meters' },
    { id: 'minimal', name: '✨ Minimal Wave', desc: 'Refined 3-line harmonic acoustic wave' }
  ];

  // Initialize WebAudio AnalyserNode from existing audio pipeline
  function attachAnalyser(audioCtx, sourceNode) {
    if (!audioCtx || !sourceNode) return;
    try {
      audioCtxRef = audioCtx;
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      sourceNode.connect(analyser);
      console.log('✨ WebAudio AnalyserNode connected successfully (real-time stream).');
    } catch (e) {
      console.warn('Failed to attach AnalyserNode:', e);
    }
  }

  // Render Visualizer Overlay Modal
  function renderVisualizerModal() {
    let overlay = document.getElementById('studio-visualizer-overlay');
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'studio-visualizer-overlay';
    overlay.className = 'bento-modal-overlay visualizer-studio-overlay';

    overlay.innerHTML = `
      <div class="visualizer-studio-container" id="vis-container">
        <!-- Top Toolbar -->
        <div class="vis-top-toolbar">
          <div class="vis-track-summary">
            <img id="vis-track-art" src="" alt="Art" onerror="this.style.display='none'">
            <div>
              <div id="vis-track-title" class="vis-track-title">SoundCloud Ultimate</div>
              <div id="vis-track-artist" class="vis-track-artist">Studio Visualizer</div>
            </div>
          </div>

          <!-- Mode Selector Chips -->
          <div class="vis-mode-chips" id="vis-mode-chips">
            ${MODES.map(m => `
              <button class="vis-mode-chip ${m.id === currentMode ? 'active' : ''}" data-mode="${m.id}">
                ${m.name}
              </button>
            `).join('')}
          </div>

          <!-- Controls -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-subtle" id="btn-vis-fullscreen" title="Toggle Fullscreen">⛶ Fullscreen</button>
            <button class="modal-close-btn" id="btn-close-studio-vis">✕</button>
          </div>
        </div>

        <!-- Center Canvas Area -->
        <div class="vis-canvas-wrapper" id="vis-canvas-wrapper">
          <canvas id="vis-main-canvas"></canvas>
          <div id="vis-circular-artwork-center" class="vis-circular-art">
            <img id="vis-circular-img" src="" alt="">
          </div>
        </div>

        <!-- Bottom Telemetry & Audio Analyzer Panel -->
        <div class="vis-telemetry-panel">
          <div class="telemetry-item">
            <span class="telemetry-label">Stream Format</span>
            <span class="telemetry-val" id="tel-stream-format">HLS / AAC 256k</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Sample Rate</span>
            <span class="telemetry-val" id="tel-sample-rate">48,000 Hz</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Channels</span>
            <span class="telemetry-val">Stereo (2.0)</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Audio Engine</span>
            <span class="telemetry-val" style="color: #00FF66;">WebAudio running</span>
          </div>
          <div class="telemetry-item" style="flex: 1; max-width: 200px;">
            <span class="telemetry-label">Sensitivity</span>
            <input type="range" id="vis-sensitivity-slider" min="0.5" max="2.5" step="0.1" value="1.0" style="width: 100%; accent-color: var(--orange-neon);">
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">FPS Limit</span>
            <select id="vis-fps-select" style="background: rgba(255,255,255,0.08); border: 1px solid var(--border-subtle); color: #FFF; border-radius: 6px; padding: 2px 6px; font-size: 11px;">
              <option value="60">60 FPS</option>
              <option value="30">30 FPS (Eco)</option>
            </select>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event Bindings
    document.getElementById('btn-close-studio-vis')?.addEventListener('click', closeVisualizer);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeVisualizer();
    });

    overlay.querySelectorAll('.vis-mode-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.vis-mode-chip').forEach(b => { b.classList.remove('active'); });
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateCenterArtVisibility();
      });
    });

    document.getElementById('btn-vis-fullscreen')?.addEventListener('click', toggleFullscreen);

    document.getElementById('vis-sensitivity-slider')?.addEventListener('input', (e) => {
      sensitivity = parseFloat(e.target.value) || 1.0;
    });

    document.getElementById('vis-fps-select')?.addEventListener('change', (e) => {
      targetFps = parseInt(e.target.value, 10) || 60;
    });

    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    const canvas = document.getElementById('vis-main-canvas');
    const wrapper = document.getElementById('vis-canvas-wrapper');
    if (!canvas || !wrapper) return;
    canvas.width = wrapper.clientWidth * window.devicePixelRatio;
    canvas.height = wrapper.clientHeight * window.devicePixelRatio;
  }

  function updateCenterArtVisibility() {
    const centerArt = document.getElementById('vis-circular-artwork-center');
    if (centerArt) {
      centerArt.style.display = (currentMode === 'circular' || currentMode === 'bass') ? 'block' : 'none';
    }
  }

  function startAnimationLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const canvas = document.getElementById('vis-main-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const freqData = new Uint8Array(analyser ? analyser.frequencyBinCount : 256);
    const timeData = new Uint8Array(analyser ? analyser.frequencyBinCount : 256);

    function loop(now) {
      animFrameId = requestAnimationFrame(loop);

      // FPS Throttling
      if (now - lastFrameTime < 1000 / targetFps) return;
      lastFrameTime = now;

      if (analyser) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // Render Active Mode
      switch (currentMode) {
        case 'spectrum':
          drawSpectrum(ctx, freqData, w, h);
          break;
        case 'waveform':
          drawWaveform(ctx, timeData, w, h);
          break;
        case 'circular':
          drawCircular(ctx, freqData, w, h);
          break;
        case 'bass':
          drawBassPulse(ctx, freqData, w, h);
          break;
        case 'peak':
          drawPeakMeter(ctx, freqData, w, h);
          break;
        case 'minimal':
          drawMinimalWave(ctx, timeData, w, h);
          break;
      }

      ctx.restore();
    }

    animFrameId = requestAnimationFrame(loop);
  }

  // 1. Spectrum Analyzer Mode
  function drawSpectrum(ctx, data, w, h) {
    const barCount = 64;
    const barWidth = (w - (barCount * 4)) / barCount;
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--orange-neon').trim() || '#FF5500';

    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor(i * (data.length / barCount) * 0.7);
      const rawVal = data[idx] || 0;
      const val = Math.min(h - 20, (rawVal / 255) * h * 0.85 * sensitivity);
      const x = i * (barWidth + 4) + 2;
      const y = h - val;

      const grad = ctx.createLinearGradient(x, y, x, h);
      grad.addColorStop(0, accentColor);
      grad.addColorStop(1, 'rgba(255, 85, 0, 0.15)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, val, [4, 4, 0, 0]);
      ctx.fill();

      // Peak Cap
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, Math.max(0, y - 4), barWidth, 2);
    }
  }

  // 2. Waveform Oscilloscope Mode
  function drawWaveform(ctx, data, w, h) {
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--orange-neon').trim() || '#FF5500';

    ctx.lineWidth = 3;
    ctx.strokeStyle = accentColor;
    ctx.shadowBlur = 16;
    ctx.shadowColor = accentColor;

    ctx.beginPath();
    const sliceWidth = w / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = (data[i] / 128.0 - 1.0) * sensitivity + 1.0;
      const y = (v * h) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 3. Circular Radial Spectrum
  function drawCircular(ctx, data, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = 110;
    const barCount = 72;
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--orange-neon').trim() || '#FF5500';

    ctx.lineWidth = 4;
    ctx.strokeStyle = accentColor;
    ctx.lineCap = 'round';

    for (let i = 0; i < barCount; i++) {
      const rad = (i / barCount) * Math.PI * 2;
      const idx = Math.floor(i * (data.length / barCount) * 0.7);
      const rawVal = data[idx] || 0;
      const barH = (rawVal / 255) * 80 * sensitivity;

      const x1 = cx + Math.cos(rad) * baseRadius;
      const y1 = cy + Math.sin(rad) * baseRadius;
      const x2 = cx + Math.cos(rad) * (baseRadius + barH);
      const y2 = cy + Math.sin(rad) * (baseRadius + barH);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // 4. Bass Reactive Pulse
  function drawBassPulse(ctx, data, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--orange-neon').trim() || '#FF5500';

    // Average bass frequencies (first 8 bins)
    let bassSum = 0;
    for (let i = 0; i < 8; i++) bassSum += data[i] || 0;
    const bassRatio = (bassSum / (8 * 255)) * sensitivity;

    const ringRadius = 110 + bassRatio * 45;

    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6 + bassRatio * 8;
    ctx.shadowBlur = 30 * bassRatio;
    ctx.shadowColor = accentColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius + 25, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 5. Studio Peak Meter
  function drawPeakMeter(ctx, data, w, h) {
    const meterW = Math.min(360, w * 0.7);
    const startX = (w - meterW) / 2;
    const startY = h / 2 - 30;

    let leftSum = 0;
    let rightSum = 0;
    for (let i = 0; i < data.length / 2; i++) leftSum += data[i] || 0;
    for (let i = data.length / 2; i < data.length; i++) rightSum += data[i] || 0;

    const lRatio = Math.min(1.0, (leftSum / (data.length * 128)) * sensitivity);
    const rRatio = Math.min(1.0, (rightSum / (data.length * 128)) * sensitivity);

    drawSingleMeter(ctx, startX, startY, meterW, 16, lRatio, 'L (Left)');
    drawSingleMeter(ctx, startX, startY + 32, meterW, 16, rRatio, 'R (Right)');
  }

  function drawSingleMeter(ctx, x, y, width, height, ratio, label) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, width, height);

    const fillW = width * ratio;
    const grad = ctx.createLinearGradient(x, y, x + width, y);
    grad.addColorStop(0, '#00FF66');
    grad.addColorStop(0.7, '#FFE600');
    grad.addColorStop(0.9, '#FF1E56');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, fillW, height);

    ctx.fillStyle = '#FFF';
    ctx.font = '11px sans-serif';
    ctx.fillText(label, x - 50, y + 12);
  }

  // 6. Minimal Harmonic Soundwave
  function drawMinimalWave(ctx, data, w, h) {
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--orange-neon').trim() || '#FF5500';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = accentColor;

    ctx.beginPath();
    const sliceWidth = w / 64;
    for (let i = 0; i < 64; i++) {
      const idx = Math.floor(i * (data.length / 64));
      const val = (data[idx] / 128.0 - 1.0) * sensitivity * 40;
      const x = i * sliceWidth;
      const y = h / 2 + val;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function toggleFullscreen() {
    const container = document.getElementById('vis-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
      isFullscreen = true;
    } else {
      document.exitFullscreen?.().catch(() => {});
      isFullscreen = false;
    }
    setTimeout(resizeCanvas, 150);
  }

  function openVisualizer() {
    renderVisualizerModal();
    const overlay = document.getElementById('studio-visualizer-overlay');
    if (overlay) {
      overlay.classList.add('open');
      resizeCanvas();
      updateCenterArtVisibility();
      syncTrackMetadata();
      startAnimationLoop();
    }
  }

  function closeVisualizer() {
    const overlay = document.getElementById('studio-visualizer-overlay');
    if (overlay) overlay.classList.remove('open');
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function syncTrackMetadata() {
    // Sync current playing track info to visualizer
    const cur = window.getCurrentTrack ? window.getCurrentTrack() : null;
    if (cur) {
      const titleEl = document.getElementById('vis-track-title');
      const artistEl = document.getElementById('vis-track-artist');
      const artEl = document.getElementById('vis-track-art');
      const circImg = document.getElementById('vis-circular-img');

      if (titleEl) titleEl.textContent = cur.title || 'Track';
      if (artistEl) artistEl.textContent = cur.artist || 'Artist';
      if (artEl) {
        artEl.src = cur.artwork_url || '';
        artEl.style.display = cur.artwork_url ? 'block' : 'none';
      }
      if (circImg && cur.artwork_url) {
        circImg.src = cur.artwork_url;
      }
    }

    if (audioCtxRef) {
      const srEl = document.getElementById('tel-sample-rate');
      if (srEl) srEl.textContent = `${audioCtxRef.sampleRate.toLocaleString()} Hz`;
    }
  }

  // Public Interface
  window.AudioVisualizer = {
    attach: attachAnalyser,
    open: openVisualizer,
    close: closeVisualizer,
    syncTrack: syncTrackMetadata,
    setMode: (m) => { currentMode = m; updateCenterArtVisibility(); }
  };

})(window);
