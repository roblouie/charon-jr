class DrawEngine {
  context: CanvasRenderingContext2D;

  constructor() {
    this.context = document.querySelector<HTMLCanvasElement>('#oc')!.getContext('2d')!;
  }

  clear() {
    this.context.clearRect(0, 0, 1920, 1080);
  }

  drawText(text: string, font: string, size: number, x: number, y: number, lineWidth: number, textAlign: 'center' | 'left' | 'right' = 'center', isItalic = true) {
    const context = this.context;
    context.font = `bold ${isItalic ? 'italic' : ''} ${size}px ${font}, serif-black`;
    context.textAlign = textAlign;
    context.textBaseline="middle";
    context.fillStyle = 'black';
    context.fillText(text, x, y);
    context.strokeStyle = 'white';
    context.lineWidth = lineWidth;
    context.strokeText(text, x, y);
  }
}

export const draw2dEngine = new DrawEngine();
