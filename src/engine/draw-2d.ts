class DrawEngine {
  context: CanvasRenderingContext2D;

  constructor() {
    // @ts-ignore
    this.context = c2d.getContext('2d')!;
  }

  clear() {
    this.context.clearRect(0, 0, 1280, 720);
  }

  drawText(text: string, font: string, size: number, x: number, y: number, lineWidth = 1, textAlign: 'center' | 'left' | 'right' = 'center', isItalic = true, fill = 'black') {
    const context = this.context;
    context.font = `bold ${isItalic ? 'italic' : ''} ${size}px ${font}, serif-black`;
    context.textAlign = textAlign;
    context.textBaseline="middle";
    context.fillStyle = fill;
    context.fillText(text, x, y);
    context.strokeStyle = 'white';
    context.lineWidth = lineWidth;
    lineWidth && context.strokeText(text, x, y);
  }
}

export const draw2d = new DrawEngine();
