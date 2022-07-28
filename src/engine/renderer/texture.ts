import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export class Texture {
  id: number;
  imageData: ImageData;
  repeat = new EnhancedDOMPoint(1, 1);

  constructor(id: number, imageData: ImageData) {
    this.imageData = imageData;
    this.id = id;
  }
}
