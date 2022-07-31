import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export class Texture {
  id: number;
  source: ImageData | HTMLCanvasElement;
  repeat = new EnhancedDOMPoint(1, 1);
  animationFunction?: () => void;

  constructor(id: number, source: ImageData | HTMLCanvasElement, animationFunction?: () => void) {
    this.source = source;
    this.id = id;
    this.animationFunction = animationFunction;
  }
}
