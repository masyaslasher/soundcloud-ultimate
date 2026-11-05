import { ExtensionConfig } from '../core/config';
import { StorageService } from '../core/storage';
import { ThemeEngine } from '../core/theme-engine';
import { SafeNetworkManager, ExtensionNetworkStats } from '../core/network-monitor';

export class SettingsPanel {
  private static container: HTMLDivElement | null = null;
  private static isOpen = false;
  private static currentTab = 'gaming';
  private static unsubscribeNet: (() => void) | null = null;

  public static async toggle(): Promise<void> {
    if (this.isOpen) {
      this.close();
    } else {
      await this.open();
    }
  }

  public static async open(): Promise<void> {
    if (this.isOpen) return;
    const config = await StorageService.getConfig();
    this.render(config);
    this.isOpen = true;
    document.body.classList.add('sc-ultimate-modal-open');

    this.unsubscribeNet = SafeNetworkManager.subscribe((stats) => {
      this.updateNetworkStatsUI(stats);
    });
  }

  public static close(): void {
    if (!this.isOpen) return;
    if (this.unsubscribeNet) {
      this.unsubscribeNet();
      this.unsubscribeNet = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.isOpen = false;
    document.body.classList.remove('sc-ultimate-modal-open');
  }

  private static render(config: ExtensionConfig): void {
    if (this.container) this.container.remove();

    this.container = document.createElement('div');
    this.container.id = 'sc-ultimate-settings-overlay';
    this.container.innerHTML = `
      <div class="sc-ult-modal">
        <!-- Sidebar Navigation -->
        <div class="sc-ult-sidebar">
          <div class="sc-ult-brand">
            <span class="sc-ult-logo-icon">⚡</span>
            <div>
              <h3>SoundCloud Ultimate</h3>
              <span class="sc-ult-badge">DOTA 2 EDITION</span>
            </div>
          </div>

          <div class="sc-ult-nav-items">
            <button class="sc-ult-nav-btn ${this.currentTab === 'gaming' ? 'active' : ''}" data-tab="gaming">
              <span class="sc-ult-icon">🎮</span> Dota 2 Gaming Mode
            </button>
            <button class="sc-ult-nav-btn ${this.currentTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
              <span class="sc-ult-icon">🎨</span> Themes & Glass
            </button>
            <button class="sc-ult-nav-btn ${this.currentTab === 'player' ? 'active' : ''}" data-tab="player">
              <span class="sc-ult-icon">🎵</span> Player & Vinyl
            </button>
            <button class="sc-ult-nav-btn ${this.currentTab === 'library' ? 'active' : ''}" data-tab="library">
              <span class="sc-ult-icon">📚</span> Library & Feed
            </button>
            <button class="sc-ult-nav-btn ${this.currentTab === 'visualizer' ? 'active' : ''}" data-tab="visualizer">
              <span class="sc-ult-icon">📊</span> Audio Visualizer
            </button>
            <button class="sc-ult-nav-btn ${this.currentTab === 'typography' ? 'active' : ''}" data-tab="typography">
              <span class="sc-ult-icon">🔤</span> Typography
            </button>
            <button class="sc-ult-nav-btn ${this.currentTab === 'system' ? 'active' : ''}" data-tab="system">
              <span class="sc-ult-icon">⚙️</span> Backup & Hotkeys
            </button>
          </div>

          <div class="sc-ult-sidebar-footer">
            <div class="sc-ult-network-pill ${config.gamingMode ? 'gaming-active' : ''}">
              <span class="dot"></span>
              <span id="sc-ult-sidebar-net-status">${config.gamingMode ? 'GAMING MODE: ON' : 'NET NORMAL'}</span>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="sc-ult-main">
          <div class="sc-ult-header">
            <div class="sc-ult-search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" id="sc-ult-search-input" placeholder="Search 30+ settings..." />
            </div>
            <button class="sc-ult-close-btn" id="sc-ult-close-btn">✕</button>
          </div>

          <div class="sc-ult-tab-content" id="sc-ult-tab-container">
            <!-- Injected by renderTab -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.container.querySelectorAll('.sc-ult-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.tab;
        if (target) {
          this.currentTab = target;
          this.container?.querySelectorAll('.sc-ult-nav-btn').forEach(b => b.classList.remove('active'));
          (e.currentTarget as HTMLElement).classList.add('active');
          this.renderTab(target, config);
        }
      });
    });

    document.getElementById('sc-ult-close-btn')?.addEventListener('click', () => this.close());
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    this.renderTab(this.currentTab, config);
  }

  private static renderTab(tab: string, config: ExtensionConfig): void {
    const container = document.getElementById('sc-ult-tab-container');
    if (!container) return;

    let html = '';

    switch (tab) {
      case 'gaming':
        html = `
          <div class="sc-ult-section-header">
            <h2>🎮 Dota 2 Gaming Mode</h2>
            <p>Guarantees zero network overhead from the extension and turns off all heavy animations so you can play Dota 2 with steady ping and maximum FPS.</p>
          </div>

          <div class="sc-ult-card sc-ult-net-card">
            <div class="sc-ult-card-title">
              <span>📶 Network & Performance Audit</span>
              <button class="sc-ult-btn-sm" id="sc-ult-reset-net-btn">Refresh</button>
            </div>
            <div class="sc-ult-net-grid">
              <div class="sc-ult-stat-box highlight-green">
                <span class="label">Extension External Requests</span>
                <span class="value" id="stat-ext-req">0</span>
                <span class="hint">100% Offline (Local Assets Only)</span>
              </div>
              <div class="sc-ult-stat-box highlight-purple">
                <span class="label">SoundCloud Audio Stream</span>
                <span class="value">Direct</span>
                <span class="hint">Zero Interception & Zero Lag</span>
              </div>
              <div class="sc-ult-stat-box">
                <span class="label">Gaming Mode Status</span>
                <span class="value" id="stat-gaming-status">${config.gamingMode ? 'ACTIVE' : 'OFF'}</span>
                <span class="hint">Toggle via Alt + G</span>
              </div>
            </div>
            <div class="sc-ult-note">
              🛡️ <strong>Safety Guarantee:</strong> This extension does not intercept, modify, or proxy your internet traffic. Original streaming from SoundCloud CDN is untouched.
            </div>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Active Dota 2 Gaming Mode</label>
                <p class="desc">Instantly kills all CSS transitions, visualizer rendering, and heavy blur passes to keep your computer responsive during Dota 2 matches.</p>
              </div>
              <input type="checkbox" id="cfg-gamingMode" class="sc-ult-switch" ${config.gamingMode ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Disable All Animations</label>
                <p class="desc">Eliminates hover and layout transitions for instantaneous UI reaction.</p>
              </div>
              <input type="checkbox" id="cfg-disableAllAnimations" class="sc-ult-switch" ${config.disableAllAnimations ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Reduced Blur Mode</label>
                <p class="desc">Replaces GPU-heavy backdrop-filter passes with pure dark glass panels.</p>
              </div>
              <input type="checkbox" id="cfg-reducedBlur" class="sc-ult-switch" ${config.reducedBlur ? 'checked' : ''} />
            </div>
          </div>
        `;
        break;

      case 'appearance':
        html = `
          <div class="sc-ult-section-header">
            <h2>🎨 Themes & Dark Glassmorphism</h2>
            <p>Fine-tune colors, glass transparency, blur intensity and custom wallpapers.</p>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Theme Palette</label>
                <p class="desc">Select between AMOLED Black, Dark Purple, Midnight or Cyberpunk.</p>
              </div>
              <select id="cfg-themeMode" class="sc-ult-select">
                <option value="amoled" ${config.themeMode === 'amoled' ? 'selected' : ''}>Pure AMOLED Black</option>
                <option value="dark-purple" ${config.themeMode === 'dark-purple' ? 'selected' : ''}>Dark Neon Purple</option>
                <option value="midnight" ${config.themeMode === 'midnight' ? 'selected' : ''}>Midnight Deep Blue</option>
                <option value="cyberpunk" ${config.themeMode === 'cyberpunk' ? 'selected' : ''}>Cyberpunk Neon</option>
                <option value="custom" ${config.themeMode === 'custom' ? 'selected' : ''}>Custom Palette</option>
              </select>
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Primary Neon Color</label>
                <p class="desc">Main glowing accent for timeline, icons and buttons.</p>
              </div>
              <input type="color" id="cfg-primaryColor" value="${config.primaryColor}" class="sc-ult-color" />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Secondary Accent Color</label>
                <p class="desc">Secondary gradient color for visual elements.</p>
              </div>
              <input type="color" id="cfg-secondaryColor" value="${config.secondaryColor}" class="sc-ult-color" />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Enable Neon Gradient</label>
                <p class="desc">Blend primary and secondary colors on timeline and buttons.</p>
              </div>
              <input type="checkbox" id="cfg-accentGradient" class="sc-ult-switch" ${config.accentGradient ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Glass Opacity (${config.glassOpacity}%)</label>
                <p class="desc">Transparency of panels and cards.</p>
              </div>
              <input type="range" id="cfg-glassOpacity" min="15" max="100" value="${config.glassOpacity}" class="sc-ult-slider" />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Blur Intensity (${config.bgBlur}px)</label>
                <p class="desc">Backdrop-filter blur radius for true glass aesthetics.</p>
              </div>
              <input type="range" id="cfg-bgBlur" min="0" max="30" value="${config.bgBlur}" class="sc-ult-slider" />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Border Radius (${config.borderRadius}px)</label>
                <p class="desc">Corner roundness for cards, inputs and player dock.</p>
              </div>
              <input type="range" id="cfg-borderRadius" min="4" max="28" value="${config.borderRadius}" class="sc-ult-slider" />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Neon Glow Power (${config.neonGlow}%)</label>
                <p class="desc">Intensity of glowing drop-shadows.</p>
              </div>
              <input type="range" id="cfg-neonGlow" min="0" max="100" value="${config.neonGlow}" class="sc-ult-slider" />
            </div>
          </div>
        `;
        break;

      case 'player':
        html = `
          <div class="sc-ult-section-header">
            <h2>🎵 Bottom Music Player</h2>
            <p>Turn the original player into a modern floating neon dock with spinning vinyl effects.</p>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Player Island Layout</label>
                <p class="desc">Floating glass dock vs standard full-width bar.</p>
              </div>
              <select id="cfg-playerStyle" class="sc-ult-select">
                <option value="glass-floating" ${config.playerStyle === 'glass-floating' ? 'selected' : ''}>Floating Neon Island</option>
                <option value="standard" ${config.playerStyle === 'standard' ? 'selected' : ''}>Full-Width AMOLED Bar</option>
              </select>
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Spinning Vinyl Effect</label>
                <p class="desc">Rotates current album cover like a vinyl record during playback.</p>
              </div>
              <input type="checkbox" id="cfg-playerVinylSpin" class="sc-ult-switch" ${config.playerVinylSpin ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Artwork Ambient Glow</label>
                <p class="desc">Emits soft colored halo around the album cover.</p>
              </div>
              <input type="checkbox" id="cfg-playerArtworkGlow" class="sc-ult-switch" ${config.playerArtworkGlow ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Progress Bar Height (${config.progressBarHeight}px)</label>
                <p class="desc">Thickness of the timeline bar.</p>
              </div>
              <input type="range" id="cfg-progressBarHeight" min="2" max="12" value="${config.progressBarHeight}" class="sc-ult-slider" />
            </div>
          </div>
        `;
        break;

      case 'library':
        html = `
          <div class="sc-ult-section-header">
            <h2>📚 Library & Feed Layout</h2>
            <p>Clean out promotions, ads and unwanted sidebars.</p>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Hide Go+ & Pro Upsells</label>
                <p class="desc">Removes subscription prompts and premium badges.</p>
              </div>
              <input type="checkbox" id="cfg-hidePromotions" class="sc-ult-switch" ${config.hidePromotions ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Hide Right Sidebar (Who to Follow, Mobile App)</label>
                <p class="desc">Expands the main music stream to 100% width.</p>
              </div>
              <input type="checkbox" id="cfg-hideSidebar" class="sc-ult-switch" ${config.hideSidebar ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Track Artwork Zoom on Hover</label>
                <p class="desc">Gently scales album art upon hovering.</p>
              </div>
              <input type="checkbox" id="cfg-trackArtworkZoom" class="sc-ult-switch" ${config.trackArtworkZoom ? 'checked' : ''} />
            </div>
          </div>
        `;
        break;

      case 'visualizer':
        html = `
          <div class="sc-ult-section-header">
            <h2>📊 Audio Visualizer</h2>
            <p>Synthesized reactive visual waves rendered locally with zero external network requests.</p>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Enable Visualizer</label>
                <p class="desc">Draw dynamic neon waves over the player dock.</p>
              </div>
              <input type="checkbox" id="cfg-visualizerEnabled" class="sc-ult-switch" ${config.visualizerEnabled ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Visualizer Style</label>
                <p class="desc">Choose between Equalizer Bars or Smooth Wave.</p>
              </div>
              <select id="cfg-visualizerStyle" class="sc-ult-select">
                <option value="synth-bars" ${config.visualizerStyle === 'synth-bars' ? 'selected' : ''}>Equalizer Bars</option>
                <option value="neon-wave" ${config.visualizerStyle === 'neon-wave' ? 'selected' : ''}>Smooth Neon Wave</option>
                <option value="pulse-circle" ${config.visualizerStyle === 'pulse-circle' ? 'selected' : ''}>Pulsing Glow</option>
              </select>
            </div>
          </div>
        `;
        break;

      case 'typography':
        html = `
          <div class="sc-ult-section-header">
            <h2>🔤 Typography & Text Scaling</h2>
            <p>Modern typography and custom font scales.</p>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Interface Font</label>
                <p class="desc">Select clean modern grotesque font.</p>
              </div>
              <select id="cfg-fontFamily" class="sc-ult-select">
                <option value="Inter" ${config.fontFamily === 'Inter' ? 'selected' : ''}>Inter (Modern UI)</option>
                <option value="Outfit" ${config.fontFamily === 'Outfit' ? 'selected' : ''}>Outfit (Geometric Sans)</option>
                <option value="JetBrains Mono" ${config.fontFamily === 'JetBrains Mono' ? 'selected' : ''}>JetBrains Mono (Tech)</option>
                <option value="system-ui" ${config.fontFamily === 'system-ui' ? 'selected' : ''}>System UI (Native)</option>
              </select>
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Font Size Scale (${config.fontSizeScale}%)</label>
                <p class="desc">Adjust overall interface text scaling.</p>
              </div>
              <input type="range" id="cfg-fontSizeScale" min="85" max="125" value="${config.fontSizeScale}" class="sc-ult-slider" />
            </div>
          </div>
        `;
        break;

      case 'system':
        html = `
          <div class="sc-ult-section-header">
            <h2>⚙️ System, Backup & Hotkeys</h2>
            <p>Save or restore your personal customizations.</p>
          </div>

          <div class="sc-ult-group">
            <div class="sc-ult-row">
              <div>
                <label class="title">Hotkeys Enabled</label>
                <p class="desc">Alt + S: Toggle Settings | Alt + G: Toggle Gaming Mode</p>
              </div>
              <input type="checkbox" id="cfg-enableHotkeys" class="sc-ult-switch" ${config.enableHotkeys ? 'checked' : ''} />
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Profile Backup</label>
                <p class="desc">Export or import your setup as a JSON file.</p>
              </div>
              <div class="sc-ult-btn-group">
                <button class="sc-ult-btn" id="sc-ult-export-btn">Export JSON</button>
                <button class="sc-ult-btn" id="sc-ult-import-btn">Import JSON</button>
              </div>
            </div>

            <div class="sc-ult-row">
              <div>
                <label class="title">Reset to Defaults</label>
                <p class="desc">Restore default AMOLED Glassmorphism parameters.</p>
              </div>
              <button class="sc-ult-btn-danger" id="sc-ult-reset-btn">Reset All</button>
            </div>
          </div>
        `;
        break;
    }

    container.innerHTML = html;
    this.bindInputs(config);
  }

  private static bindInputs(config: ExtensionConfig): void {
    const switches = this.container?.querySelectorAll('.sc-ult-switch');
    switches?.forEach(el => {
      el.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        const key = input.id.replace('cfg-', '') as keyof ExtensionConfig;
        (config as any)[key] = input.checked;
        await StorageService.saveConfig(config);
        ThemeEngine.applyConfig(config);

        const netStatus = document.getElementById('sc-ult-sidebar-net-status');
        const pill = document.querySelector('.sc-ult-network-pill');
        const gamingStatus = document.getElementById('stat-gaming-status');
        if (key === 'gamingMode') {
          if (netStatus && pill) {
            if (input.checked) {
              netStatus.textContent = 'GAMING MODE: ON';
              pill.classList.add('gaming-active');
            } else {
              netStatus.textContent = 'NET NORMAL';
              pill.classList.remove('gaming-active');
            }
          }
          if (gamingStatus) {
            gamingStatus.textContent = input.checked ? 'ACTIVE' : 'OFF';
          }
        }
      });
    });

    const sliders = this.container?.querySelectorAll('.sc-ult-slider');
    sliders?.forEach(el => {
      el.addEventListener('input', async (e) => {
        const input = e.target as HTMLInputElement;
        const key = input.id.replace('cfg-', '') as keyof ExtensionConfig;
        (config as any)[key] = Number(input.value);
        await StorageService.saveConfig(config);
        ThemeEngine.applyConfig(config);
      });
    });

    const selects = this.container?.querySelectorAll('.sc-ult-select, .sc-ult-color');
    selects?.forEach(el => {
      el.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement | HTMLSelectElement;
        const key = input.id.replace('cfg-', '') as keyof ExtensionConfig;
        (config as any)[key] = input.value;
        await StorageService.saveConfig(config);
        ThemeEngine.applyConfig(config);
      });
    });

    document.getElementById('sc-ult-export-btn')?.addEventListener('click', () => {
      const json = StorageService.exportAsJSON(config);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'soundcloud-ultimate-settings.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('sc-ult-import-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const text = await input.files[0].text();
          const imported = StorageService.importFromJSON(text);
          if (imported) {
            await StorageService.saveConfig(imported);
            ThemeEngine.applyConfig(imported);
            this.render(imported);
          }
        }
      };
      input.click();
    });

    document.getElementById('sc-ult-reset-btn')?.addEventListener('click', async () => {
      if (confirm('Reset all settings to default AMOLED Glassmorphism?')) {
        const def = await StorageService.resetToDefaults();
        ThemeEngine.applyConfig(def);
        this.render(def);
      }
    });
  }

  private static updateNetworkStatsUI(stats: ExtensionNetworkStats): void {
    const ext = document.getElementById('stat-ext-req');
    if (ext) ext.textContent = stats.ownRequestsCount.toString();
  }
}
