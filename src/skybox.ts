import { BufferGeometry, BufferType } from '@/renderer/buffer-geometry';
import { textureLoader } from '@/renderer/texture-loader';

export class Skybox extends BufferGeometry {
  constructor(positiveXTexture: ImageData, negativeXTexture: ImageData, positiveYTexture: ImageData, negativeYTexture: ImageData, positiveZTexture: ImageData, negativeZTexture: ImageData) {
    super();
    textureLoader.loadCubemap(positiveXTexture, negativeXTexture, positiveYTexture, negativeYTexture, positiveZTexture, negativeZTexture);
    this.setBuffer(BufferType.Positions, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), 2);
  }
}

