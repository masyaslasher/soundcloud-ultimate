export interface ExtensionConfig {
  // Appearance & Themes
  themeMode: 'amoled' | 'dark-purple' | 'midnight' | 'cyberpunk' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  accentGradient: boolean;
  bgBrightness: number; // 0 to 100 (%)
  bgBlur: number; // 0 to 30 (px)
  glassOpacity: number; // 10 to 100 (%)
  borderRadius: number; // 0 to 28 (px)
  neonGlow: number; // 0 to 100 (%)
  borderWidth: number; // 0 to 3 (px)
  customWallpaper: string; // URL / Data URL

  // Player
  playerStyle: 'glass-floating' | 'standard' | 'compact';
  playerArtworkGlow: boolean;
  playerVinylSpin: boolean;
  progressBarHeight: number; // 2 to 12 (px)
  progressBarGlow: boolean;
  showRemainingTime: boolean;

  // Visualizer (CSS/Canvas synth, zero network)
  visualizerEnabled: boolean;
  visualizerStyle: 'synth-bars' | 'neon-wave' | 'pulse-circle';

  // Library & Feed Layout
  compactTrackCards: boolean;
  trackArtworkZoom: boolean;
  hidePromotions: boolean; // Visual hiding via CSS only (no network interception)
  hideSidebar: boolean;

  // Typography & System
  fontFamily: 'Inter' | 'Outfit' | 'JetBrains Mono' | 'system-ui' | 'default';
  fontSizeScale: number; // 85 to 125 (%)
  fontWeight: '300' | '400' | '500' | '600' | '700';
  disableAllAnimations: boolean;
  reducedBlur: boolean;
  enableHotkeys: boolean;

  // Safe Gaming Mode (Dota 2)
  gamingMode: boolean;
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  themeMode: 'amoled',
  primaryColor: '#a855f7',
  secondaryColor: '#ec4899',
  accentGradient: true,
  bgBrightness: 25,
  bgBlur: 16,
  glassOpacity: 75,
  borderRadius: 16,
  neonGlow: 70,
  borderWidth: 1,
  customWallpaper: '',

  playerStyle: 'glass-floating',
  playerArtworkGlow: true,
  playerVinylSpin: false,
  progressBarHeight: 5,
  progressBarGlow: true,
  showRemainingTime: true,

  visualizerEnabled: false,
  visualizerStyle: 'synth-bars',

  compactTrackCards: false,
  trackArtworkZoom: true,
  hidePromotions: true,
  hideSidebar: true,

  fontFamily: 'Inter',
  fontSizeScale: 100,
  fontWeight: '400',
  disableAllAnimations: false,
  reducedBlur: false,
  enableHotkeys: true,

  gamingMode: false,
};
