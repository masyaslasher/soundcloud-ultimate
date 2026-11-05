import { StorageService } from '../core/storage';
import { ThemeEngine } from '../core/theme-engine';
import { QuickButton } from '../ui/quick-button';
import { PlayerCustomizer } from '../features/player-customizer';
import { HotkeysHandler } from '../features/hotkeys';
import { AudioVisualizer } from '../features/visualizer';

import '../styles/theme.css';
import '../styles/settings-panel.css';

console.log('[SoundCloud Ultimate] Initializing UI Engine...');

async function bootstrap() {
  const config = await StorageService.getConfig();

  // Apply CSS Variables and Glassmorphism Engine
  ThemeEngine.applyConfig(config);

  // Initialize UI features safely
  QuickButton.init();
  PlayerCustomizer.init(config);
  HotkeysHandler.init(config);
  AudioVisualizer.init(config);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes['sc_ultimate_settings']) {
        const newCfg = changes['sc_ultimate_settings'].newValue;
        if (newCfg) {
          ThemeEngine.applyConfig(newCfg);
          PlayerCustomizer.updatePlayerLayout(newCfg);
          AudioVisualizer.init(newCfg);
        }
      }
    });
  }

  console.log('[SoundCloud Ultimate] Ready.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
