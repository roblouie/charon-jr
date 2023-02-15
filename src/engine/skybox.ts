import { AttributeLocation } from '@/engine/renderer/renderer';
import { gl } from '@/engine/renderer/lil-gl';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export class Skybox extends MoldableCubeGeometry {
  constructor(...textureSources: TexImageSource[]) {
    super();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, gl.createTexture());
    textureSources.forEach((tex, index) => {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    this.setAttribute_(AttributeLocation.Positions, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), 2);
  }
}
