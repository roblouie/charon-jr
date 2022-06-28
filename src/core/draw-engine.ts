class DrawEngine {
  private _context?: CanvasRenderingContext2D | null;

  get context(): CanvasRenderingContext2D {
    if (!this._context) {
      throw new Error('must call initializeDrawEngine first');
    }
    return this._context;
  }

  get width() {
    return this.context.canvas.width;
  }

  get height() {
    return this.context.canvas.height;
  }

  initialize(canvas: HTMLCanvasElement) {
    this._context = canvas.getContext('2d');
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    const context = this.context;

    context.font = `${fontSize}px Impact, sans-serif-black`;
    context.textAlign = textAlign;
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.strokeText(text, x, y);
    context.fillStyle = color;
    context.fillText(text, x, y);
  }
}

export const drawEngine = new DrawEngine();
