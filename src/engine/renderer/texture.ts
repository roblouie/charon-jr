import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export class Texture {
  id: number;
  source: TexImageSource;
  repeat = new EnhancedDOMPoint(1, 1);

  constructor(id: number, source: TexImageSource) {
    this.source = source;
    this.id = id;
  }
}
