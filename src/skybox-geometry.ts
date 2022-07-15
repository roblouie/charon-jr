import { BufferGeometry } from '@/renderer/buffer-geometry';

export class SkyboxGeometry extends BufferGeometry {
  constructor() {
    super();
    this.setPositions(new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), 2);
  }
}

export const skybox = new SkyboxGeometry();
skybox.bindGeometry();
