import { ExtensionConfig } from '../core/config';
import { StorageService } from '../core/storage';
import { SettingsPanel } from '../ui/settings-panel';
import { ThemeEngine } from '../core/theme-engine';

export class HotkeysHandler {
  public static init(config: ExtensionConfig): void {
    window.addEventListener('keydown', async (e) => {
      if (!config.enableHotkeys) return;

      // Don't trigger when user is typing in search or comments
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      // Alt + S -> Toggle Settings
      if (e.altKey && (e.key === 's' || e.key === 'ы' || e.code === 'KeyS')) {
        e.preventDefault();
        SettingsPanel.toggle();
      }

      // Alt + G -> Quick Toggle Dota 2 Gaming Mode
      if (e.altKey && (e.key === 'g' || e.key === 'п' || e.code === 'KeyG')) {
        e.preventDefault();
        config.gamingMode = !config.gamingMode;
        await StorageService.saveConfig(config);
        ThemeEngine.applyConfig(config);
      }
    });
  }
}
