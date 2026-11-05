import { ExtensionConfig, DEFAULT_CONFIG } from './config';

const STORAGE_KEY = 'sc_ultimate_settings';

export class StorageService {
  private static cachedConfig: ExtensionConfig = { ...DEFAULT_CONFIG };

  public static async getConfig(): Promise<ExtensionConfig> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        if (result && result[STORAGE_KEY]) {
          this.cachedConfig = { ...DEFAULT_CONFIG, ...result[STORAGE_KEY] };
        }
      } catch (err) {
        console.warn('[SoundCloud Ultimate] Failed to read from chrome.storage:', err);
      }
    } else {
      // Fallback for direct browser preview
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          this.cachedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(local) };
        } catch {}
      }
    }
    return this.cachedConfig;
  }

  public static async saveConfig(config: ExtensionConfig): Promise<void> {
    this.cachedConfig = { ...config };
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: config });
      } catch (err) {
        console.warn('[SoundCloud Ultimate] Failed to save to chrome.storage:', err);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }

  public static async updateConfig(partial: Partial<ExtensionConfig>): Promise<ExtensionConfig> {
    const current = await this.getConfig();
    const updated = { ...current, ...partial };
    await this.saveConfig(updated);
    return updated;
  }

  public static async resetToDefaults(): Promise<ExtensionConfig> {
    await this.saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  public static exportAsJSON(config: ExtensionConfig): string {
    return JSON.stringify(config, null, 2);
  }

  public static importFromJSON(jsonString: string): ExtensionConfig | null {
    try {
      const parsed = JSON.parse(jsonString);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return null;
    }
  }
}
