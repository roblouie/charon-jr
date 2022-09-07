import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export class Texture {
  id: number;
  source: ImageData | HTMLCanvasElement;
  repeat = new EnhancedDOMPoint(1, 1);

  constructor(id: number, source: ImageData | HTMLCanvasElement) {
    this.source = source;
    this.id = id;
  }
}
