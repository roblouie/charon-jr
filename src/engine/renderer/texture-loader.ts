import { gl } from '@/engine/renderer/lil-gl';
import { Texture } from '@/engine/renderer/texture';

class TextureLoader {
  textures: Texture[] = [];

  load(textureSource: ImageData | HTMLCanvasElement, animationFunction?: () => void): Texture {
    const texture = new Texture(this.textures.length, textureSource, animationFunction);
    this.textures.push(texture);
    return texture;
  }

  bindTextures() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 8, gl.RGBA8, 128, 128, this.textures.length);

    this.textures.forEach((texture, index) => {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
    });
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  }
}

export const textureLoader = new TextureLoader();
