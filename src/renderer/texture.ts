export class Texture {
  id: number;
  imageData: ImageData;

  constructor(id: number, imageData: ImageData) {
    this.imageData = imageData;
    this.id = id;
  }
}
