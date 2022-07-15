import { BufferGeometry, BufferType } from '@/renderer/buffer-geometry';
import { textureLoader } from '@/renderer/texture-loader';
import { drawSky } from '@/texture-creation/texture-maker';

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

const skyRight = drawSky('z', 'y', 'x', 0, true);
const skyLeft = drawSky('z', 'y', 'x', 127); // GOOD

const skyCeiling = drawSky('x', 'z', 'y', 0);
const skyFloor = drawSky('x', 'z', 'y', 127);

const skyFront = drawSky('x', 'y', 'z', 0); // GOOD
const skyBack = drawSky('x', 'y', 'z', 127, true);

export const skybox = new Skybox(
  skyRight,
  skyLeft,
  skyCeiling,
  skyFloor,
  skyFront,
  skyBack,
);
skybox.bindGeometry();
