import { gl, lilgl } from '@/lil-gl';
import { Texture } from '@/renderer/texture';
import { U_SKYBOX } from '@/shaders/shaders';

class TextureLoader {
  textures: Texture[] = [];
  cubeMapTextures: Texture[] = [];

  load(imageData: ImageData): Texture {
    const texture = new Texture(this.textures.length, imageData);
    this.textures.push(texture);
    return texture;
  }

  loadCubemap(positiveX: ImageData, negativeX: ImageData, positiveY: ImageData, negativeY: ImageData, positiveZ: ImageData, negativeZ: ImageData) {
    this.cubeMapTextures = [
      this.load(positiveX),
      this.load(negativeX),
      this.load(positiveY),
      this.load(negativeY),
      this.load(positiveZ),
      this.load(negativeZ),
    ];
  }

  bindTextures() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 8, gl.RGBA8, 128, 128, this.textures.length);
    gl.activeTexture(gl.TEXTURE0);

    this.textures.forEach((texture, index) => {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, texture.imageData);
    });
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);

    if (this.cubeMapTextures.length) {
      gl.activeTexture(gl.TEXTURE1)
      const cubemapTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
      this.cubeMapTextures.forEach((tex, index) => {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imageData)
      });
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    }
  }
}

export const textureLoader = new TextureLoader();
