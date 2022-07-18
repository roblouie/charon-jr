import { BufferGeometry } from '@/renderer/buffer-geometry';
import { textureLoader } from '@/renderer/texture-loader';
import { AttributeLocation } from '@/renderer/renderer';

export class Skybox extends BufferGeometry {
  constructor(positiveXTexture: ImageData, negativeXTexture: ImageData, positiveYTexture: ImageData, negativeYTexture: ImageData, positiveZTexture: ImageData, negativeZTexture: ImageData) {
    super();
    textureLoader.loadCubemap(positiveXTexture, negativeXTexture, positiveYTexture, negativeYTexture, positiveZTexture, negativeZTexture);
    this.setAttribute(AttributeLocation.Positions, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), 2);
  }
}

