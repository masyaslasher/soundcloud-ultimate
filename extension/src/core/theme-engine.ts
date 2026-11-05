import { ExtensionConfig } from './config';
import { SafeNetworkManager } from './network-monitor';

export class ThemeEngine {
  private static styleElement: HTMLStyleElement | null = null;
  private static wallpaperElement: HTMLDivElement | null = null;

  public static init(): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'sc-ultimate-theme-vars';
      (document.head || document.documentElement).appendChild(this.styleElement);
    }

    if (!this.wallpaperElement) {
      this.wallpaperElement = document.createElement('div');
      this.wallpaperElement.id = 'sc-ultimate-wallpaper';
      if (document.body) {
        document.body.appendChild(this.wallpaperElement);
      }
    }
  }

  public static applyConfig(config: ExtensionConfig): void {
    this.init();

    SafeNetworkManager.setGamingMode(config.gamingMode);

    let bgBase = '#000000';
    let bgSurface = 'rgba(12, 10, 18, 0.75)';
    let primary = config.primaryColor;
    let secondary = config.secondaryColor;

    switch (config.themeMode) {
      case 'amoled':
        bgBase = '#000000';
        bgSurface = `rgba(10, 8, 16, ${config.glassOpacity / 100})`;
        break;
      case 'dark-purple':
        bgBase = '#080312';
        bgSurface = `rgba(20, 10, 36, ${config.glassOpacity / 100})`;
        break;
      case 'midnight':
        bgBase = '#040714';
        bgSurface = `rgba(8, 16, 32, ${config.glassOpacity / 100})`;
        break;
      case 'cyberpunk':
        bgBase = '#060210';
        bgSurface = `rgba(22, 8, 38, ${config.glassOpacity / 100})`;
        primary = '#00f0ff';
        secondary = '#ff0055';
        break;
      case 'custom':
        bgBase = '#000000';
        bgSurface = `rgba(14, 14, 20, ${config.glassOpacity / 100})`;
        break;
    }

    const effectiveBlur = config.gamingMode || config.reducedBlur ? 0 : config.bgBlur;
    const backdropFilter = effectiveBlur > 0 ? `blur(${effectiveBlur}px)` : 'none';

    const cssVars = `
      :root {
        --sc-ult-bg-base: ${bgBase};
        --sc-ult-bg-surface: ${bgSurface};
        --sc-ult-bg-card: rgba(22, 16, 32, ${(config.glassOpacity / 100) * 0.85});
        --sc-ult-primary: ${primary};
        --sc-ult-secondary: ${secondary};
        --sc-ult-accent: ${config.accentGradient 
          ? `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` 
          : primary};
        --sc-ult-radius: ${config.borderRadius}px;
        --sc-ult-border-width: ${config.borderWidth}px;
        --sc-ult-border-color: rgba(255, 255, 255, 0.09);
        --sc-ult-border-glow: rgba(${this.hexToRgb(primary)}, 0.4);
        --sc-ult-neon-glow: 0 0 ${config.neonGlow / 3}px ${primary};
        --sc-ult-backdrop: ${backdropFilter};
        --sc-ult-font-family: ${config.fontFamily === 'default' ? 'inherit' : `"${config.fontFamily}", sans-serif`};
        --sc-ult-font-scale: ${config.fontSizeScale / 100};
        --sc-ult-font-weight: ${config.fontWeight};
        --sc-ult-progress-height: ${config.progressBarHeight}px;
        --sc-ult-anim-duration: ${config.disableAllAnimations || config.gamingMode ? '0s' : '0.25s'};
      }

      ${config.disableAllAnimations || config.gamingMode ? `
        *, *::before, *::after {
          animation-duration: 0.001s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001s !important;
        }
      ` : ''}

      ${config.hidePromotions ? `
        .l-header-subnav,
        .sidebarHeader__premium,
        .soundBadge__premium,
        .premiumUpsell,
        .announcementBar,
        .upsellBanner,
        .header__upgrade,
        .proBadge {
          display: none !important;
        }
      ` : ''}

      ${config.hideSidebar ? `
        .l-sidebar-right {
          display: none !important;
        }
        .l-main {
          margin-right: 0 !important;
          max-width: 100% !important;
        }
      ` : ''}
    `;

    if (this.styleElement) {
      this.styleElement.textContent = cssVars;
    }

    if (this.wallpaperElement) {
      if (config.customWallpaper && !config.gamingMode) {
        this.wallpaperElement.style.backgroundImage = `url("${config.customWallpaper}")`;
        this.wallpaperElement.style.opacity = `${config.bgBrightness / 100}`;
        this.wallpaperElement.style.display = 'block';
      } else {
        this.wallpaperElement.style.backgroundImage = 'none';
        this.wallpaperElement.style.display = 'none';
      }
    }

    document.documentElement.dataset.scGamingMode = config.gamingMode ? 'true' : 'false';
  }

  private static hexToRgb(hex: string): string {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return `${r}, ${g}, ${b}`;
    }
    const num = parseInt(clean, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }
}
