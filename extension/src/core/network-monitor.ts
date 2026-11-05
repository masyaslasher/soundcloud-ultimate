export interface ExtensionNetworkStats {
  ownRequestsCount: number;
  isGamingModeActive: boolean;
  backgroundTasksActive: boolean;
  startTime: number;
}

export class SafeNetworkManager {
  private static stats: ExtensionNetworkStats = {
    ownRequestsCount: 0,
    isGamingModeActive: false,
    backgroundTasksActive: true,
    startTime: Date.now()
  };

  private static listeners: Array<(stats: ExtensionNetworkStats) => void> = [];

  public static setGamingMode(active: boolean): void {
    this.stats.isGamingModeActive = active;
    this.stats.backgroundTasksActive = !active;
    this.notify();
  }

  public static getStats(): ExtensionNetworkStats {
    return { ...this.stats };
  }

  public static subscribe(listener: (stats: ExtensionNetworkStats) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStats());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.getStats());
      } catch {}
    }
  }

  public static reset(): void {
    this.stats.ownRequestsCount = 0;
    this.stats.startTime = Date.now();
    this.notify();
  }
}
