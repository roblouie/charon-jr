class DrawEngine {
  private context: CanvasRenderingContext2D;

  constructor() {
    this.context = document.querySelector<HTMLCanvasElement>('#oc')!.getContext('2d')!;
  }

  clear() {
    this.context.clearRect(0, 0, 1280, 720);
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    this.clear();
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
