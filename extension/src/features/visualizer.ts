import { ExtensionConfig } from '../core/config';

export class AudioVisualizer {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static animId: number | null = null;
  private static isRunning = false;

  public static init(config: ExtensionConfig): void {
    if (!config.visualizerEnabled || config.gamingMode) {
      this.destroy();
      return;
    }

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'sc-ult-canvas-visualizer';
      this.canvas.width = 600;
      this.canvas.height = 40;
      this.canvas.style.cssText = `
        position: fixed;
        bottom: 72px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 40px;
        pointer-events: none;
        z-index: 100;
        opacity: 0.85;
      `;
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    this.startLoop(config);
  }

  private static startLoop(config: ExtensionConfig): void {
    if (this.isRunning) return;
    this.isRunning = true;

    let phase = 0;

    const render = () => {
      if (!this.canvas || !this.ctx || !this.isRunning) return;

      const playBtn = document.querySelector('.playControl');
      const isPlaying = playBtn?.classList.contains('playing');

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (isPlaying) {
        phase += 0.05;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barsCount = 24;
        const barWidth = width / barsCount - 4;

        for (let i = 0; i < barsCount; i++) {
          const barHeight = Math.abs(Math.sin(phase + i * 0.25)) * (height * 0.8) + 4;
          const x = i * (barWidth + 4);
          const y = height - barHeight;

          const grad = this.ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, config.primaryColor);
          grad.addColorStop(1, config.secondaryColor);

          this.ctx.fillStyle = grad;
          this.ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      this.animId = requestAnimationFrame(render);
    };

    this.animId = requestAnimationFrame(render);
  }

  public static destroy(): void {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }
  }
}
