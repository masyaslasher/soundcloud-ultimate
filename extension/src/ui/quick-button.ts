import { SettingsPanel } from './settings-panel';

export class QuickButton {
  private static timer: any = null;

  public static init(): void {
    const tryInsert = () => {
      if (document.getElementById('sc-ultimate-header-btn')) {
        if (this.timer) clearInterval(this.timer);
        return;
      }

      const headerRight = document.querySelector('.header__right, .header__navMenu, .header__user');
      if (headerRight) {
        const btn = document.createElement('button');
        btn.id = 'sc-ultimate-header-btn';
        btn.className = 'header__link';
        btn.title = 'SoundCloud Ultimate Settings (Alt + S)';
        btn.innerHTML = `
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.25));
            border: 1px solid rgba(168, 85, 247, 0.5);
            padding: 4px 10px;
            border-radius: 12px;
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
          ">
            <span>⚡</span>
            <span>ULTIMATE</span>
          </span>
        `;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          SettingsPanel.toggle();
        });

        headerRight.prepend(btn);
        if (this.timer) clearInterval(this.timer);
      }
    };

    tryInsert();
    // Re-check a few times on SPA load, then stop
    let attempts = 0;
    this.timer = setInterval(() => {
      attempts++;
      tryInsert();
      if (attempts > 10) {
        clearInterval(this.timer);
      }
    }, 1500);
  }
}
