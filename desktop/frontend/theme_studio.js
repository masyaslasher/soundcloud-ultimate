/**
 * SoundCloud Ultimate — Theme Studio & Design Token Engine
 * Phase 2: Complete Appearance Customization & Professional Minimalism
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'sc_theme_config_v2';

  // 15 Curated Presets (5 Minimalist Design Tokens + 10 Classic AMOLED Palettes)
  const PRESETS = {
    'graphite': {
      name: 'Graphite Minimal',
      category: 'Minimalist',
      desc: 'Dark charcoal & graphite with subtle neutral borders',
      colors: {
        bg: '#101010',
        surface: '#171717',
        dock: 'rgba(23, 23, 23, 0.96)',
        hover: '#222222',
        border: '#2B2B2B',
        borderHover: '#444444',
        accent: '#4A90E2',
        accentBright: '#64B5F6',
        accentGlow: 'rgba(74, 144, 226, 0.25)',
        textMain: '#F0F0F0',
        textMuted: '#999999',
        textDim: '#686868'
      },
      swatches: ['#101010', '#1E1E1E', '#4A90E2']
    },
    'amoled-black': {
      name: 'AMOLED Pure Black',
      category: 'Minimalist',
      desc: 'Absolute 0% black OLED canvas with sleek silver accents',
      colors: {
        bg: '#000000',
        surface: '#0E0E0E',
        dock: 'rgba(12, 12, 12, 0.98)',
        hover: '#1C1C1C',
        border: '#222222',
        borderHover: '#3E3E3E',
        accent: '#E0E0E0',
        accentBright: '#FFFFFF',
        accentGlow: 'rgba(255, 255, 255, 0.15)',
        textMain: '#F5F5F5',
        textMuted: '#888888',
        textDim: '#555555'
      },
      swatches: ['#000000', '#1C1C1C', '#E0E0E0']
    },
    'minimal-dark': {
      name: 'Minimal Slate Dark',
      category: 'Minimalist',
      desc: 'Cool slate tones with indigo accents and restrained shadows',
      colors: {
        bg: '#121214',
        surface: '#1A1A1E',
        dock: 'rgba(26, 26, 30, 0.96)',
        hover: '#26262C',
        border: '#2D2D35',
        borderHover: '#464655',
        accent: '#6366F1',
        accentBright: '#818CF8',
        accentGlow: 'rgba(99, 102, 241, 0.25)',
        textMain: '#EBEBF0',
        textMuted: '#9494A0',
        textDim: '#606070'
      },
      swatches: ['#121214', '#1A1A1E', '#6366F1']
    },
    'purple-minimal': {
      name: 'Purple Minimal',
      category: 'Minimalist',
      desc: 'Deep obsidian violet surfaces with pastel lavender highlights',
      colors: {
        bg: '#130F1C',
        surface: '#1D172B',
        dock: 'rgba(29, 23, 43, 0.96)',
        hover: '#29203D',
        border: '#2F2445',
        borderHover: '#A78BFA',
        accent: '#A78BFA',
        accentBright: '#C4B5FD',
        accentGlow: 'rgba(167, 139, 250, 0.25)',
        textMain: '#EDE9FE',
        textMuted: '#A79CC4',
        textDim: '#6B6185'
      },
      swatches: ['#130F1C', '#1D172B', '#A78BFA']
    },
    'light': {
      name: 'Clean Light',
      category: 'Minimalist',
      desc: 'Crisp studio paper white with graphite text and signature orange',
      colors: {
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        dock: 'rgba(255, 255, 255, 0.98)',
        hover: '#EDEFF2',
        border: '#D8DCE3',
        borderHover: '#FF5500',
        accent: '#FF5500',
        accentBright: '#FF6A00',
        accentGlow: 'rgba(255, 85, 0, 0.2)',
        textMain: '#18191B',
        textMuted: '#60646C',
        textDim: '#8C9099'
      },
      swatches: ['#F8F9FA', '#FFFFFF', '#FF5500']
    },
    'onyx': {
      name: 'Onyx Orange',
      category: 'AMOLED Classic',
      desc: 'SoundCloud signature deep black with vivid neon orange',
      colors: {
        bg: '#0A090E',
        surface: 'rgba(20, 19, 26, 0.72)',
        dock: 'rgba(18, 17, 24, 0.94)',
        hover: 'rgba(32, 30, 42, 0.85)',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 85, 0, 0.4)',
        accent: '#FF5500',
        accentBright: '#FF6A00',
        accentGlow: 'rgba(255, 85, 0, 0.35)',
        textMain: '#FFFFFF',
        textMuted: '#A3A1B2',
        textDim: '#6B687E'
      },
      swatches: ['#FF5500', '#0A090E', '#FF7700']
    },
    'cyberpunk': {
      name: 'Cyberpunk 2077',
      category: 'AMOLED Classic',
      desc: 'Electric yellow & cyan with night city styling',
      colors: {
        bg: '#08070B',
        surface: 'rgba(24, 20, 32, 0.75)',
        dock: 'rgba(20, 16, 28, 0.95)',
        hover: 'rgba(38, 30, 52, 0.85)',
        border: 'rgba(255, 230, 0, 0.12)',
        borderHover: 'rgba(255, 230, 0, 0.5)',
        accent: '#FFE600',
        accentBright: '#FFF04D',
        accentGlow: 'rgba(255, 230, 0, 0.45)',
        textMain: '#FFFFFF',
        textMuted: '#C2BED6',
        textDim: '#7D7896'
      },
      swatches: ['#FFE600', '#00F0FF', '#08070B']
    },
    'synthwave': {
      name: 'Midnight Synthwave',
      category: 'AMOLED Classic',
      desc: 'Hot magenta pink & ultraviolet retro 80s aesthetics',
      colors: {
        bg: '#0A0612',
        surface: 'rgba(28, 16, 42, 0.75)',
        dock: 'rgba(22, 12, 34, 0.95)',
        hover: 'rgba(45, 22, 68, 0.85)',
        border: 'rgba(247, 37, 133, 0.12)',
        borderHover: 'rgba(247, 37, 133, 0.5)',
        accent: '#F72585',
        accentBright: '#FF4D9E',
        accentGlow: 'rgba(247, 37, 133, 0.45)',
        textMain: '#FFFFFF',
        textMuted: '#D0BCD6',
        textDim: '#897491'
      },
      swatches: ['#F72585', '#7209B7', '#0A0612']
    },
    'nordic': {
      name: 'Nordic Frost',
      category: 'AMOLED Classic',
      desc: 'Glacial ice cyan & deep arctic sapphire hues',
      colors: {
        bg: '#060B11',
        surface: 'rgba(12, 24, 38, 0.75)',
        dock: 'rgba(9, 19, 32, 0.95)',
        hover: 'rgba(18, 36, 56, 0.85)',
        border: 'rgba(0, 210, 255, 0.12)',
        borderHover: 'rgba(0, 210, 255, 0.45)',
        accent: '#00D2FF',
        accentBright: '#38BDF8',
        accentGlow: 'rgba(0, 210, 255, 0.4)',
        textMain: '#FFFFFF',
        textMuted: '#94B4D1',
        textDim: '#5B7691'
      },
      swatches: ['#00D2FF', '#3B82F6', '#060B11']
    },
    'matrix': {
      name: 'Matrix Emerald',
      category: 'AMOLED Classic',
      desc: 'Hacker phosphor green on pitch terminal black',
      colors: {
        bg: '#040905',
        surface: 'rgba(10, 24, 15, 0.75)',
        dock: 'rgba(8, 20, 12, 0.95)',
        hover: 'rgba(16, 38, 22, 0.85)',
        border: 'rgba(0, 255, 102, 0.12)',
        borderHover: 'rgba(0, 255, 102, 0.45)',
        accent: '#00FF66',
        accentBright: '#33FF85',
        accentGlow: 'rgba(0, 255, 102, 0.4)',
        textMain: '#FFFFFF',
        textMuted: '#99D1AA',
        textDim: '#568A65'
      },
      swatches: ['#00FF66', '#059669', '#040905']
    },
    'crimson': {
      name: 'Crimson Obsidian',
      category: 'AMOLED Classic',
      desc: 'Deep ruby red neon glow on vampire obsidian',
      colors: {
        bg: '#0C0406',
        surface: 'rgba(28, 12, 16, 0.75)',
        dock: 'rgba(22, 9, 12, 0.95)',
        hover: 'rgba(44, 18, 24, 0.85)',
        border: 'rgba(255, 30, 86, 0.12)',
        borderHover: 'rgba(255, 30, 86, 0.45)',
        accent: '#FF1E56',
        accentBright: '#FF4778',
        accentGlow: 'rgba(255, 30, 86, 0.45)',
        textMain: '#FFFFFF',
        textMuted: '#D19CA9',
        textDim: '#8A5863'
      },
      swatches: ['#FF1E56', '#990024', '#0C0406']
    },
    'sakura': {
      name: 'Sakura Blossom',
      category: 'AMOLED Classic',
      desc: 'Tokyo night pastel rose and soft magenta violet',
      colors: {
        bg: '#0D0810',
        surface: 'rgba(28, 16, 30, 0.75)',
        dock: 'rgba(22, 12, 24, 0.95)',
        hover: 'rgba(42, 22, 46, 0.85)',
        border: 'rgba(255, 102, 196, 0.12)',
        borderHover: 'rgba(255, 102, 196, 0.45)',
        accent: '#FF66C4',
        accentBright: '#FF85D0',
        accentGlow: 'rgba(255, 102, 196, 0.4)',
        textMain: '#FFFFFF',
        textMuted: '#D4A8C6',
        textDim: '#8E6782'
      },
      swatches: ['#FF66C4', '#B84DFF', '#0D0810']
    },
    'solar': {
      name: 'Solar Amber',
      category: 'AMOLED Classic',
      desc: 'Liquid gold and warm sunset ember hues',
      colors: {
        bg: '#0B0804',
        surface: 'rgba(26, 18, 10, 0.75)',
        dock: 'rgba(20, 14, 8, 0.95)',
        hover: 'rgba(42, 28, 14, 0.85)',
        border: 'rgba(255, 183, 3, 0.12)',
        borderHover: 'rgba(255, 183, 3, 0.45)',
        accent: '#FFB703',
        accentBright: '#FFC533',
        accentGlow: 'rgba(255, 183, 3, 0.4)',
        textMain: '#FFFFFF',
        textMuted: '#D6C09A',
        textDim: '#8A7756'
      },
      swatches: ['#FFB703', '#FB8500', '#0B0804']
    },
    'hyperpop': {
      name: 'Hyperpop Acid',
      category: 'AMOLED Classic',
      desc: 'Amethyst violet contrast with acid electric lime',
      colors: {
        bg: '#090610',
        surface: 'rgba(24, 16, 38, 0.75)',
        dock: 'rgba(18, 12, 30, 0.95)',
        hover: 'rgba(36, 22, 56, 0.85)',
        border: 'rgba(168, 85, 247, 0.12)',
        borderHover: 'rgba(163, 230, 53, 0.45)',
        accent: '#A3E635',
        accentBright: '#BEF264',
        accentGlow: 'rgba(163, 230, 53, 0.4)',
        textMain: '#FFFFFF',
        textMuted: '#B9A9D1',
        textDim: '#78698F'
      },
      swatches: ['#A3E635', '#8B5CF6', '#090610']
    },
    'titanium': {
      name: 'Titanium Platinum',
      category: 'AMOLED Classic',
      desc: 'Pitch obsidian luxury with pure platinum silver',
      colors: {
        bg: '#000000',
        surface: 'rgba(22, 22, 25, 0.75)',
        dock: 'rgba(18, 18, 20, 0.96)',
        hover: 'rgba(34, 34, 38, 0.85)',
        border: 'rgba(255, 255, 255, 0.1)',
        borderHover: 'rgba(255, 255, 255, 0.5)',
        accent: '#FFFFFF',
        accentBright: '#F1F5F9',
        accentGlow: 'rgba(255, 255, 255, 0.35)',
        textMain: '#FFFFFF',
        textMuted: '#B4B4B8',
        textDim: '#6C6C70'
      },
      swatches: ['#FFFFFF', '#94A3B8', '#000000']
    }
  };

  const DEFAULT_CONFIG = {
    activeThemeId: 'graphite',
    isCustom: false,
    customColors: {
      bg: '#101010',
      surface: '#171717',
      dock: '#141414',
      border: '#2B2B2B',
      accent: '#4A90E2',
      textMain: '#F0F0F0',
      textMuted: '#999999'
    },
    density: 'comfortable', // 'compact', 'comfortable', 'expanded'
    borderRadius: 'smooth', // 'sharp', 'subtle', 'smooth', 'round', 'pill'
    fontScale: 'default',   // 'small', 'default', 'large'
    fontFamily: 'system',   // 'system', 'inter', 'mono', 'serif'
    borderThickness: 1      // 1 or 2
  };

  let state = loadConfig();

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_CONFIG, parsed);
      }
    } catch (_) {}
    return Object.assign({}, DEFAULT_CONFIG);
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function applyTokens() {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) return;

    // 1. Layout Density
    body.classList.remove('density-compact', 'density-comfortable', 'density-expanded');
    body.classList.add(`density-${state.density || 'comfortable'}`);

    // 2. Border Radius Token
    const radiusMap = {
      sharp: { sm: '2px', md: '4px', lg: '6px', pill: '9999px' },
      subtle: { sm: '4px', md: '8px', lg: '12px', pill: '9999px' },
      smooth: { sm: '8px', md: '14px', lg: '20px', pill: '9999px' },
      round: { sm: '12px', md: '20px', lg: '28px', pill: '9999px' }
    };
    const r = radiusMap[state.borderRadius] || radiusMap.smooth;
    root.style.setProperty('--radius-sm', r.sm);
    root.style.setProperty('--radius-md', r.md);
    root.style.setProperty('--radius-lg', r.lg);

    // 3. Font Scale Token
    const fontScaleMap = {
      small: '13px',
      default: '14px',
      large: '15.5px'
    };
    root.style.setProperty('--font-size-base', fontScaleMap[state.fontScale] || '14px');

    // 4. Font Family Token
    const fontFamilies = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
      serif: 'Georgia, Cambria, "Times New Roman", serif'
    };
    root.style.setProperty('--font-family', fontFamilies[state.fontFamily] || fontFamilies.system);

    // 5. Border Thickness
    root.style.setProperty('--ui-border-width', `${state.borderThickness || 1}px`);

    // 6. Theme Colors (Preset vs Custom)
    if (state.isCustom && state.customColors) {
      root.removeAttribute('data-theme');
      const c = state.customColors;
      root.style.setProperty('--bg-amoled', c.bg);
      root.style.setProperty('--surface-glass', c.surface);
      root.style.setProperty('--surface-dock', c.dock || c.surface);
      root.style.setProperty('--surface-hover', adjustBrightness(c.surface, 15));
      root.style.setProperty('--border-subtle', c.border);
      root.style.setProperty('--border-hover', c.accent);
      root.style.setProperty('--border-active', c.accent);
      root.style.setProperty('--orange-neon', c.accent);
      root.style.setProperty('--orange-bright', adjustBrightness(c.accent, 20));
      root.style.setProperty('--orange-glow', hexToRgba(c.accent, 0.35));
      root.style.setProperty('--text-main', c.textMain || '#F0F0F0');
      root.style.setProperty('--text-muted', c.textMuted || '#999999');
      root.style.setProperty('--text-dim', adjustBrightness(c.textMuted || '#999999', -30));

      if (window.setSmokeThemeColor) {
        const rgb = hexToRgbArr(c.accent);
        window.setSmokeThemeColor(rgb[0], rgb[1], rgb[2]);
      }
    } else {
      // Clear custom inline styles and apply preset attribute
      const presetId = state.activeThemeId || 'graphite';
      root.setAttribute('data-theme', presetId);

      // Clear inline color overrides so data-theme CSS kicks in
      const colorProps = [
        '--bg-amoled', '--surface-glass', '--surface-dock', '--surface-hover',
        '--border-subtle', '--border-hover', '--border-active', '--orange-neon',
        '--orange-bright', '--orange-glow', '--text-main', '--text-muted', '--text-dim'
      ];
      colorProps.forEach(p => root.style.removeProperty(p));

      // Smoke color sync
      const preset = PRESETS[presetId];
      if (preset && window.setSmokeThemeColor) {
        const rgb = hexToRgbArr(preset.colors.accent);
        window.setSmokeThemeColor(rgb[0], rgb[1], rgb[2]);
      }
    }

    // Keep legacy localStorage in sync for backward compatibility
    try {
      localStorage.setItem('sc_theme', state.isCustom ? 'custom' : state.activeThemeId);
    } catch (_) {}
  }

  function adjustBrightness(hex, percent) {
    if (!hex || hex.startsWith('rgba')) return hex;
    let num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return hex;
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function hexToRgba(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function hexToRgbArr(hex) {
    if (!hex || !hex.startsWith('#')) return [74, 144, 226];
    const r = parseInt(hex.slice(1, 3), 16) || 74;
    const g = parseInt(hex.slice(3, 5), 16) || 144;
    const b = parseInt(hex.slice(5, 7), 16) || 226;
    return [r, g, b];
  }

  // Render Theme Studio Modal UI
  function renderThemeStudioModal() {
    let overlay = document.getElementById('theme-studio-modal-overlay');
    if (overlay) return; // already created

    overlay = document.createElement('div');
    overlay.id = 'theme-studio-modal-overlay';
    overlay.className = 'bento-modal-overlay';

    overlay.innerHTML = `
      <div class="bento-modal theme-studio-modal">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.23 19.57 10.58 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Theme Studio & Appearance</span>
            <span class="studio-badge">Professional</span>
          </div>
          <button class="modal-close-btn" id="btn-close-theme-studio">✕</button>
        </div>

        <!-- Studio Navigation Tabs -->
        <div class="studio-nav-bar">
          <button class="studio-nav-btn active" data-tab="presets">Presets (15)</button>
          <button class="studio-nav-btn" data-tab="colors">Custom Colors</button>
          <button class="studio-nav-btn" data-tab="layout">Appearance & Layout</button>
          <button class="studio-nav-btn" data-tab="data">Export / Import</button>
        </div>

        <!-- Modal Body Container -->
        <div class="modal-body studio-body">
          <!-- TAB 1: PRESETS -->
          <div class="studio-tab-content active" id="studio-tab-presets">
            <div class="studio-presets-grid" id="studio-presets-grid">
              <!-- Rendered via JS -->
            </div>
          </div>

          <!-- TAB 2: CUSTOM COLORS -->
          <div class="studio-tab-content" id="studio-tab-colors">
            <div class="studio-colors-editor">
              <div class="studio-editor-banner">
                <span style="font-size: 13px; font-weight: 600;">Custom Palette Mode</span>
                <button class="btn-subtle" id="btn-enable-custom-colors">⚡ Enable Custom Mode</button>
              </div>
              <div class="color-picker-grid">
                <div class="color-picker-field">
                  <label>Main Background</label>
                  <div class="picker-input-wrap">
                    <input type="color" id="picker-bg" value="${state.customColors.bg}">
                    <span class="picker-hex" id="label-picker-bg">${state.customColors.bg}</span>
                  </div>
                </div>
                <div class="color-picker-field">
                  <label>Surface / Panels</label>
                  <div class="picker-input-wrap">
                    <input type="color" id="picker-surface" value="${state.customColors.surface}">
                    <span class="picker-hex" id="label-picker-surface">${state.customColors.surface}</span>
                  </div>
                </div>
                <div class="color-picker-field">
                  <label>Border & Outlines</label>
                  <div class="picker-input-wrap">
                    <input type="color" id="picker-border" value="${state.customColors.border}">
                    <span class="picker-hex" id="label-picker-border">${state.customColors.border}</span>
                  </div>
                </div>
                <div class="color-picker-field">
                  <label>Accent & Brand Color</label>
                  <div class="picker-input-wrap">
                    <input type="color" id="picker-accent" value="${state.customColors.accent}">
                    <span class="picker-hex" id="label-picker-accent">${state.customColors.accent}</span>
                  </div>
                </div>
                <div class="color-picker-field">
                  <label>Primary Text</label>
                  <div class="picker-input-wrap">
                    <input type="color" id="picker-text" value="${state.customColors.textMain}">
                    <span class="picker-hex" id="label-picker-text">${state.customColors.textMain}</span>
                  </div>
                </div>
                <div class="color-picker-field">
                  <label>Muted Text</label>
                  <div class="picker-input-wrap">
                    <input type="color" id="picker-muted" value="${state.customColors.textMuted}">
                    <span class="picker-hex" id="label-picker-muted">${state.customColors.textMuted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: APPEARANCE & LAYOUT -->
          <div class="studio-tab-content" id="studio-tab-layout">
            <div class="studio-appearance-settings">
              <div class="setting-row">
                <div class="setting-meta">
                  <div class="setting-title">Interface Density</div>
                  <div class="setting-desc">Adjust whitespace, card padding, and player sizing</div>
                </div>
                <div class="segmented-control" id="control-density">
                  <button class="seg-btn ${state.density === 'compact' ? 'active' : ''}" data-val="compact">Compact</button>
                  <button class="seg-btn ${state.density === 'comfortable' ? 'active' : ''}" data-val="comfortable">Comfortable</button>
                  <button class="seg-btn ${state.density === 'expanded' ? 'active' : ''}" data-val="expanded">Expanded</button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-meta">
                  <div class="setting-title">Border Curvature</div>
                  <div class="setting-desc">Configure corner roundness across cards, buttons and modals</div>
                </div>
                <div class="segmented-control" id="control-radius">
                  <button class="seg-btn ${state.borderRadius === 'sharp' ? 'active' : ''}" data-val="sharp">Sharp (2px)</button>
                  <button class="seg-btn ${state.borderRadius === 'subtle' ? 'active' : ''}" data-val="subtle">Subtle (6px)</button>
                  <button class="seg-btn ${state.borderRadius === 'smooth' ? 'active' : ''}" data-val="smooth">Smooth (14px)</button>
                  <button class="seg-btn ${state.borderRadius === 'round' ? 'active' : ''}" data-val="round">Round (20px)</button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-meta">
                  <div class="setting-title">Typography Scale</div>
                  <div class="setting-desc">Adjust UI font size hierarchy</div>
                </div>
                <div class="segmented-control" id="control-font-scale">
                  <button class="seg-btn ${state.fontScale === 'small' ? 'active' : ''}" data-val="small">Compact (13px)</button>
                  <button class="seg-btn ${state.fontScale === 'default' ? 'active' : ''}" data-val="default">Default (14px)</button>
                  <button class="seg-btn ${state.fontScale === 'large' ? 'active' : ''}" data-val="large">Large (15.5px)</button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-meta">
                  <div class="setting-title">Font Family</div>
                  <div class="setting-desc">Choose typography style</div>
                </div>
                <div class="segmented-control" id="control-font-family">
                  <button class="seg-btn ${state.fontFamily === 'system' ? 'active' : ''}" data-val="system">System</button>
                  <button class="seg-btn ${state.fontFamily === 'inter' ? 'active' : ''}" data-val="inter">Modern Sans</button>
                  <button class="seg-btn ${state.fontFamily === 'mono' ? 'active' : ''}" data-val="mono">Monospace</button>
                  <button class="seg-btn ${state.fontFamily === 'serif' ? 'active' : ''}" data-val="serif">Serif</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: EXPORT / IMPORT -->
          <div class="studio-tab-content" id="studio-tab-data">
            <div class="studio-data-vault">
              <div class="vault-card">
                <h4>💾 Backup & Export Theme Configuration</h4>
                <p>Save your active palette, typography, and density settings to a portable JSON file or clipboard.</p>
                <div style="display: flex; gap: 10px; margin-top: 12px;">
                  <button class="btn-vault" id="btn-export-theme-json">Download Theme JSON</button>
                  <button class="btn-vault" id="btn-copy-theme-json">Copy JSON to Clipboard</button>
                </div>
              </div>

              <div class="vault-card">
                <h4>📥 Import Custom Theme</h4>
                <p>Load an exported theme preset from JSON text.</p>
                <textarea id="theme-import-textarea" class="vault-textarea" placeholder="Paste theme JSON here..."></textarea>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                  <button class="btn-vault" id="btn-apply-theme-import">Apply Imported Theme</button>
                </div>
              </div>

              <div class="vault-card" style="border-color: rgba(255, 85, 85, 0.25);">
                <h4 style="color: #FF5555;">⚠️ Factory Appearance Reset</h4>
                <p>Restore default Graphite Minimal theme, standard density, and smooth curvature.</p>
                <button class="btn-vault" id="btn-reset-theme-defaults" style="background: rgba(255, 85, 85, 0.15); color: #FF5555; border-color: rgba(255, 85, 85, 0.4); margin-top: 10px;">
                  Reset All to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind event listeners
    bindStudioEvents(overlay);
    renderPresetsGrid();
  }

  function renderPresetsGrid() {
    const grid = document.getElementById('studio-presets-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(PRESETS).forEach(id => {
      const p = PRESETS[id];
      const isActive = !state.isCustom && state.activeThemeId === id;
      const card = document.createElement('div');
      card.className = `studio-preset-card ${isActive ? 'active' : ''}`;
      card.dataset.themeId = id;

      card.innerHTML = `
        <div class="preset-banner" style="background: linear-gradient(135deg, ${p.colors.bg} 0%, ${p.colors.surface} 100%);">
          <div class="preset-swatches">
            <span class="preset-swatch" style="background: ${p.swatches[0]};"></span>
            <span class="preset-swatch" style="background: ${p.swatches[1]};"></span>
            <span class="preset-swatch" style="background: ${p.swatches[2]};"></span>
          </div>
        </div>
        <div class="preset-info">
          <div class="preset-header">
            <span class="preset-name">${p.name}</span>
            ${isActive ? '<span class="preset-active-tag">Active</span>' : ''}
          </div>
          <div class="preset-desc">${p.desc}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        applyPreset(id);
      });

      grid.appendChild(card);
    });
  }

  function bindStudioEvents(overlay) {
    // Close button & backdrop click
    document.getElementById('btn-close-theme-studio')?.addEventListener('click', closeThemeStudio);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeThemeStudio();
    });

    // Tab Navigation
    overlay.querySelectorAll('.studio-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.studio-nav-btn').forEach(b => b.classList.remove('active'));
        overlay.querySelectorAll('.studio-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        const target = document.getElementById(`studio-tab-${tab}`);
        if (target) target.classList.add('active');
      });
    });

    // Color Pickers
    const pickers = [
      { id: 'picker-bg', prop: 'bg' },
      { id: 'picker-surface', prop: 'surface' },
      { id: 'picker-border', prop: 'border' },
      { id: 'picker-accent', prop: 'accent' },
      { id: 'picker-text', prop: 'textMain' },
      { id: 'picker-muted', prop: 'textMuted' }
    ];

    pickers.forEach(item => {
      const el = document.getElementById(item.id);
      const label = document.getElementById(`label-${item.id}`);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = e.target.value;
          if (label) label.textContent = val;
          state.isCustom = true;
          state.customColors[item.prop] = val;
          saveConfig();
          applyTokens();
          renderPresetsGrid();
        });
      }
    });

    document.getElementById('btn-enable-custom-colors')?.addEventListener('click', () => {
      state.isCustom = true;
      saveConfig();
      applyTokens();
      renderPresetsGrid();
      if (window.showToast) window.showToast('🎨 Custom Color Mode Activated');
    });

    // Density segmented control
    overlay.querySelectorAll('#control-density .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('#control-density .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.density = btn.dataset.val;
        saveConfig();
        applyTokens();
      });
    });

    // Radius segmented control
    overlay.querySelectorAll('#control-radius .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('#control-radius .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.borderRadius = btn.dataset.val;
        saveConfig();
        applyTokens();
      });
    });

    // Font Scale segmented control
    overlay.querySelectorAll('#control-font-scale .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('#control-font-scale .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.fontScale = btn.dataset.val;
        saveConfig();
        applyTokens();
      });
    });

    // Font Family segmented control
    overlay.querySelectorAll('#control-font-family .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('#control-font-family .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.fontFamily = btn.dataset.val;
        saveConfig();
        applyTokens();
      });
    });

    // Data Export
    document.getElementById('btn-export-theme-json')?.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `soundcloud-ultimate-theme-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (window.showToast) window.showToast('💾 Theme JSON Downloaded');
    });

    document.getElementById('btn-copy-theme-json')?.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(state, null, 2)).then(() => {
        if (window.showToast) window.showToast('📋 Theme JSON Copied to Clipboard');
      });
    });

    // Data Import
    document.getElementById('btn-apply-theme-import')?.addEventListener('click', () => {
      const ta = document.getElementById('theme-import-textarea');
      if (!ta) return;
      try {
        const imported = JSON.parse(ta.value.trim());
        if (typeof imported === 'object') {
          state = Object.assign({}, DEFAULT_CONFIG, imported);
          saveConfig();
          applyTokens();
          renderPresetsGrid();
          ta.value = '';
          if (window.showToast) window.showToast('✨ Custom Theme Successfully Loaded');
        }
      } catch (e) {
        if (window.showToast) window.showToast('⚠️ Invalid JSON Format: ' + e.message);
      }
    });

    // Reset Defaults
    document.getElementById('btn-reset-theme-defaults')?.addEventListener('click', () => {
      if (confirm('Reset all theme and appearance settings back to Graphite Minimal?')) {
        state = Object.assign({}, DEFAULT_CONFIG);
        saveConfig();
        applyTokens();
        renderPresetsGrid();
        if (window.showToast) window.showToast('🔄 Appearance Reset to Factory Defaults');
      }
    });
  }

  function openThemeStudio() {
    renderThemeStudioModal();
    const overlay = document.getElementById('theme-studio-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  function closeThemeStudio() {
    const overlay = document.getElementById('theme-studio-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function applyPreset(presetId) {
    if (!PRESETS[presetId]) presetId = 'graphite';
    state.isCustom = false;
    state.activeThemeId = presetId;
    saveConfig();
    applyTokens();
    renderPresetsGrid();
    if (window.showToast) {
      window.showToast(`🎨 Theme Applied: ${PRESETS[presetId].name}`);
    }
  }

  // Public Interface
  window.ThemeStudio = {
    init: function() {
      applyTokens();
      // Wire up header theme button to open Theme Studio
      const btnTheme = document.getElementById('btn-theme-modal');
      if (btnTheme) {
        btnTheme.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openThemeStudio();
        });
      }
    },
    open: openThemeStudio,
    close: closeThemeStudio,
    applyPreset: applyPreset,
    getPresets: () => PRESETS,
    getConfig: () => Object.assign({}, state)
  };

  // Immediate token application on script load
  applyTokens();

})(window);
