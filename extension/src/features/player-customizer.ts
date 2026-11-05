import { ExtensionConfig } from '../core/config';

export class PlayerCustomizer {
  private static observer: MutationObserver | null = null;
  private static isObserving = false;

  public static init(config: ExtensionConfig): void {
    this.updatePlayerLayout(config);
    this.setupObserver(config);
  }

  public static updatePlayerLayout(config: ExtensionConfig): void {
    document.documentElement.dataset.playerStyle = config.playerStyle;
    document.documentElement.dataset.vinylSpin = config.playerVinylSpin ? 'true' : 'false';

    const duration = document.querySelector('.playbackTimeline__duration');
    if (duration && config.showRemainingTime) {
      duration.classList.add('sc-ult-remaining-active');
    }
  }

  private static setupObserver(config: ExtensionConfig): void {
    if (this.isObserving) return;

    const checkAndAttach = () => {
      const target = document.querySelector('.playControls__elements');
      if (!target) return false;

      if (this.observer) this.observer.disconnect();

      this.observer = new MutationObserver(() => {
        const playBtn = document.querySelector('.playControl');
        const avatar = document.querySelector('.playbackSoundBadge__avatar');
        
        if (playBtn && avatar) {
          const isPlaying = playBtn.classList.contains('playing');
          if (isPlaying) {
            avatar.classList.add('sc-is-playing');
          } else {
            avatar.classList.remove('sc-is-playing');
          }
        }
      });

      this.observer.observe(target, { attributes: true, subtree: true, attributeFilter: ['class'] });
      this.isObserving = true;
      return true;
    };

    if (!checkAndAttach()) {
      // Safe check once after 2 seconds, no infinite recursion
      setTimeout(checkAndAttach, 2500);
    }
  }
}
