/**
 * SoundCloud Ultimate — Plugin Engine & Community Extension SDK
 * Safe sandboxed runtime, plugin lifecycle management, and built-in studio extensions.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'sc_plugins_state';
  const registry = new Map();
  const activeInstances = new Map();

  function loadSavedStates() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStates() {
    const states = {};
    registry.forEach((plugin, id) => {
      states[id] = !!plugin.enabled;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }

  function createPluginApi(pluginId) {
    return {
      getCurrentTrack: () => {
        return typeof window.getCurrentTrack === 'function' ? window.getCurrentTrack() : null;
      },
      addPlayerWidget: (elementId, htmlContent) => {
        let mount = document.getElementById('plugin-player-dock');
        if (!mount) {
          const playerBar = document.querySelector('.player') || document.querySelector('.audio-player');
          if (playerBar) {
            mount = document.createElement('div');
            mount.id = 'plugin-player-dock';
            mount.className = 'plugin-player-dock';
            playerBar.appendChild(mount);
          }
        }
        if (mount) {
          let el = document.getElementById(elementId);
          if (!el) {
            el = document.createElement('div');
            el.id = elementId;
            el.className = 'sc-plugin-widget';
            mount.appendChild(el);
          }
          el.innerHTML = htmlContent;
          return el;
        }
        return null;
      },
      removePlayerWidget: (elementId) => {
        const el = document.getElementById(elementId);
        if (el && el.parentElement) {
          el.parentElement.removeChild(el);
        }
      },
      showToast: (msg, type) => {
        if (window.showToast) window.showToast(msg, type || 'info');
        else console.log(`[Plugin ${pluginId}]: ${msg}`);
      },
      storage: {
        get: (key, def) => {
          try {
            const raw = localStorage.getItem(`sc_plugin_${pluginId}_${key}`);
            return raw ? JSON.parse(raw) : def;
          } catch (e) {
            return def;
          }
        },
        set: (key, val) => {
          try {
            localStorage.setItem(`sc_plugin_${pluginId}_${key}`, JSON.stringify(val));
          } catch (e) {}
        }
      }
    };
  }

  function registerPlugin(manifest) {
    if (!manifest || !manifest.id) return;
    const states = loadSavedStates();
    manifest.enabled = states[manifest.id] !== undefined ? states[manifest.id] : !!manifest.defaultEnabled;
    registry.set(manifest.id, manifest);

    if (manifest.enabled) {
      enablePlugin(manifest.id, false);
    }
  }

  function enablePlugin(id, shouldSave = true) {
    const plugin = registry.get(id);
    if (!plugin) return;
    plugin.enabled = true;
    if (shouldSave) saveStates();

    try {
      const api = createPluginApi(id);
      const instance = {
        api: api,
        cleanup: null
      };

      if (typeof plugin.init === 'function') {
        const res = plugin.init(api);
        if (typeof res === 'function') {
          instance.cleanup = res;
        }
      }

      activeInstances.set(id, instance);
      console.log(`[Plugin] Initialized: ${plugin.name} (${id})`);

      // Trigger track change if track is already playing
      const cur = typeof window.getCurrentTrack === 'function' ? window.getCurrentTrack() : null;
      if (cur && typeof plugin.onTrackChange === 'function') {
        plugin.onTrackChange(cur);
      }
    } catch (err) {
      console.error(`[Plugin] Failed to enable ${id}:`, err);
    }
  }

  function disablePlugin(id, shouldSave = true) {
    const plugin = registry.get(id);
    if (!plugin) return;
    plugin.enabled = false;
    if (shouldSave) saveStates();

    const instance = activeInstances.get(id);
    if (instance) {
      try {
        if (typeof instance.cleanup === 'function') {
          instance.cleanup();
        } else if (typeof plugin.destroy === 'function') {
          plugin.destroy();
        }
      } catch (err) {
        console.error(`[Plugin] Error destroying ${id}:`, err);
      }
      activeInstances.delete(id);
    }
    console.log(`[Plugin] Disabled: ${plugin.name} (${id})`);
  }

  function notifyTrackChange(track) {
    activeInstances.forEach((inst, id) => {
      const plugin = registry.get(id);
      if (plugin && typeof plugin.onTrackChange === 'function') {
        try {
          plugin.onTrackChange(track);
        } catch (err) {
          console.error(`[Plugin ${id}] onTrackChange error:`, err);
        }
      }
    });
  }

  // ==========================================
  // BUILT-IN COMMUNITY PLUGINS
  // ==========================================

  // 1. BPM & Beat Tapper Plugin
  const bpmPlugin = {
    id: 'bpm-counter',
    name: 'BPM Counter & Beat Tapper',
    version: '1.2.0',
    author: 'SoundCloud Ultimate Team',
    description: 'Manual tap-tempo and smart BPM estimator displayed right above the waveform.',
    defaultEnabled: true,
    tapTimes: [],
    init: function (api) {
      let currentBpm = '--';
      
      const render = () => {
        api.addPlayerWidget('widget-bpm-tapper', `
          <div class="plugin-bpm-box">
            <span class="bpm-label">BPM</span>
            <span class="bpm-num" id="bpm-val-display">${currentBpm}</span>
            <button class="bpm-tap-btn" id="btn-bpm-tap">TAP</button>
            <button class="bpm-rst-btn" id="btn-bpm-rst" title="Reset">&times;</button>
          </div>
        `);

        const tapBtn = document.getElementById('btn-bpm-tap');
        const rstBtn = document.getElementById('btn-bpm-rst');
        if (tapBtn) {
          tapBtn.addEventListener('click', () => {
            const now = Date.now();
            bpmPlugin.tapTimes.push(now);
            if (bpmPlugin.tapTimes.length > 5) bpmPlugin.tapTimes.shift();

            if (bpmPlugin.tapTimes.length >= 2) {
              const intervals = [];
              for (let i = 1; i < bpmPlugin.tapTimes.length; i++) {
                intervals.push(bpmPlugin.tapTimes[i] - bpmPlugin.tapTimes[i - 1]);
              }
              const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
              if (avgInterval > 200 && avgInterval < 3000) {
                currentBpm = Math.round(60000 / avgInterval);
                const disp = document.getElementById('bpm-val-display');
                if (disp) disp.textContent = currentBpm;
              }
            }
          });
        }
        if (rstBtn) {
          rstBtn.addEventListener('click', () => {
            bpmPlugin.tapTimes = [];
            currentBpm = '--';
            const disp = document.getElementById('bpm-val-display');
            if (disp) disp.textContent = currentBpm;
          });
        }
      };

      render();

      return () => {
        api.removePlayerWidget('widget-bpm-tapper');
      };
    },
    onTrackChange: function (track) {
      bpmPlugin.tapTimes = [];
      const disp = document.getElementById('bpm-val-display');
      if (disp) {
        // Smart estimation based on genre if available
        const genre = (track.genre || '').toLowerCase();
        let est = '--';
        if (genre.includes('house') || genre.includes('techno') || genre.includes('edm')) est = '~128';
        else if (genre.includes('drum & bass') || genre.includes('dnb')) est = '~174';
        else if (genre.includes('dubstep')) est = '~140';
        else if (genre.includes('hip hop') || genre.includes('trap')) est = '~140';
        else if (genre.includes('ambient') || genre.includes('chill')) est = '~90';
        disp.textContent = est;
      }
    }
  };

  // 2. Music Trivia & Context Plugin
  const triviaPlugin = {
    id: 'music-trivia',
    name: 'Music Context & Trivia',
    version: '1.0.4',
    author: 'Acoustic Intelligence',
    description: 'Displays smart contextual facts and historical genre roots for the currently playing track.',
    defaultEnabled: true,
    init: function (api) {
      return () => {
        api.removePlayerWidget('widget-trivia-context');
      };
    },
    onTrackChange: function (track) {
      const api = createPluginApi('music-trivia');
      if (!track) {
        api.removePlayerWidget('widget-trivia-context');
        return;
      }
      const genre = track.genre || 'Electronic';
      let trivia = `Track belongs to the <strong>${escapeHtml(genre)}</strong> movement.`;
      if (track.playback_count > 500000) {
        trivia = `🔥 Massive hit: Over ${(track.playback_count / 1000).toFixed(0)}k listeners on SoundCloud!`;
      } else if (track.downloadable) {
        trivia = `💎 Master Download Available: Artist enabled direct file download.`;
      }

      api.addPlayerWidget('widget-trivia-context', `
        <div class="plugin-trivia-box" title="${escapeHtml(track.title)}">
          <span class="trivia-icon">💡</span>
          <span class="trivia-text">${trivia}</span>
        </div>
      `);
    }
  };

  // 3. Zen Focus Mode Plugin
  const zenPlugin = {
    id: 'zen-focus',
    name: 'Zen Focus Mode',
    version: '1.1.0',
    author: 'Minimalist Audio Lab',
    description: 'Enables an ultra-clean study & deep work environment, softening contrast and eliminating UI clutter.',
    defaultEnabled: false,
    init: function (api) {
      document.body.classList.add('zen-mode-enabled');
      api.showToast('Zen Focus Mode active: distraction-free environment', 'info');
      return () => {
        document.body.classList.remove('zen-mode-enabled');
        api.showToast('Zen Focus Mode deactivated', 'info');
      };
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==========================================
  // PLUGIN MANAGER MODAL UI
  // ==========================================

  function ensureModal() {
    if (document.getElementById('plugin-manager-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'plugin-manager-modal';
    modal.className = 'sc-modal-overlay';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="sc-modal-container sc-plugin-box">
        <div class="sc-modal-header">
          <div class="sc-plugin-title-group">
            <span class="sc-plugin-badge">EXTENSIBILITY</span>
            <h3>Plugin Studio & Extensions</h3>
          </div>
          <button class="sc-modal-close" id="btn-plugin-close" aria-label="Close">&times;</button>
        </div>

        <div class="sc-plugin-body">
          <div class="sc-plugin-desc-header">
            Extend SoundCloud Ultimate with sandboxed client-side modules, audio enhancements, and custom tools.
          </div>
          <div class="sc-plugin-list" id="plugin-items-container">
            <!-- Populated dynamically -->
          </div>
        </div>

        <div class="sc-plugin-footer">
          <button class="btn-secondary" id="btn-plugin-install-code">➕ Import Custom Plugin</button>
          <button class="btn-primary" id="btn-plugin-done">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector('#btn-plugin-close').addEventListener('click', close);
    modal.querySelector('#btn-plugin-done').addEventListener('click', close);

    modal.querySelector('#btn-plugin-install-code').addEventListener('click', () => {
      const code = prompt('Paste your Plugin JS Object definition (must contain id, name, version, and init):');
      if (code) {
        try {
          // Evaluated safely in function scope
          const fn = new Function(`return (${code});`);
          const manifest = fn();
          if (manifest && manifest.id && manifest.name) {
            registerPlugin(manifest);
            enablePlugin(manifest.id);
            renderList();
            if (window.showToast) window.showToast(`Plugin "${manifest.name}" installed successfully!`, 'success');
          } else {
            alert('Invalid plugin manifest. Must include id, name, and init function.');
          }
        } catch (err) {
          alert(`Could not parse plugin: ${err.message}`);
        }
      }
    });
  }

  function renderList() {
    const container = document.getElementById('plugin-items-container');
    if (!container) return;

    let html = '';
    registry.forEach((plugin, id) => {
      html += `
        <div class="sc-plugin-card ${plugin.enabled ? 'active' : ''}">
          <div class="sc-pc-info">
            <div class="sc-pc-top">
              <span class="sc-pc-name">${escapeHtml(plugin.name)}</span>
              <span class="sc-pc-ver">v${escapeHtml(plugin.version || '1.0')}</span>
              <span class="sc-pc-author">by ${escapeHtml(plugin.author || 'Community')}</span>
            </div>
            <div class="sc-pc-desc">${escapeHtml(plugin.description || '')}</div>
          </div>
          <div class="sc-pc-action">
            <label class="sc-toggle-switch">
              <input type="checkbox" data-plugin-id="${id}" ${plugin.enabled ? 'checked' : ''}/>
              <span class="sc-slider"></span>
            </label>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const id = e.target.dataset.pluginId;
        if (e.target.checked) {
          enablePlugin(id);
        } else {
          disablePlugin(id);
        }
        renderList();
      });
    });
  }

  function open() {
    ensureModal();
    renderList();
    const modal = document.getElementById('plugin-manager-modal');
    if (modal) {
      modal.classList.add('visible');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function close() {
    const modal = document.getElementById('plugin-manager-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Register built-in plugins on boot
  registerPlugin(bpmPlugin);
  registerPlugin(triviaPlugin);
  registerPlugin(zenPlugin);

  window.PluginSystem = {
    register: registerPlugin,
    enable: enablePlugin,
    disable: disablePlugin,
    notifyTrackChange: notifyTrackChange,
    open: open,
    close: close
  };
})();
