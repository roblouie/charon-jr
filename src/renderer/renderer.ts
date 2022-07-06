import { lilgl } from "@/lil-gl";
import { Camera } from "@/renderer/camera";
import { Object3d } from "@/renderer/object-3d";
import {
  drawBricks,
  drawGrass,
  drawStoneWalkway,
  drawTest,
  drawWater
} from '@/textures/texture-maker';

export class Renderer {
  modelviewProjectionLocation: WebGLUniformLocation;
  normalMatrixLocation: WebGLUniformLocation;
  colorLocation: WebGLUniformLocation;

  constructor() {
    lilgl.gl.useProgram(lilgl.program);
    lilgl.gl.enable(lilgl.gl.CULL_FACE);
    lilgl.gl.enable(lilgl.gl.DEPTH_TEST);
    this.modelviewProjectionLocation = lilgl.gl.getUniformLocation(lilgl.program, 'modelviewProjection')!;
    this.normalMatrixLocation =  lilgl.gl.getUniformLocation(lilgl.program, 'normalMatrix')!;
    this.colorLocation =  lilgl.gl.getUniformLocation(lilgl.program, 'color')!;

    const texture = lilgl.gl.createTexture();
    lilgl.gl.bindTexture(lilgl.gl.TEXTURE_2D_ARRAY, texture);
    lilgl.gl.texStorage3D(lilgl.gl.TEXTURE_2D_ARRAY, 8, lilgl.gl.RGBA8, 128, 128, 3);

    lilgl.gl.texSubImage3D(lilgl.gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, 128, 128, 1, lilgl.gl.RGBA, lilgl.gl.UNSIGNED_BYTE, drawBricks());
    lilgl.gl.texSubImage3D(lilgl.gl.TEXTURE_2D_ARRAY, 0, 0, 0, 1, 128, 128, 1, lilgl.gl.RGBA, lilgl.gl.UNSIGNED_BYTE, drawGrass());
    lilgl.gl.texSubImage3D(lilgl.gl.TEXTURE_2D_ARRAY, 0, 0, 0, 2, 128, 128, 1, lilgl.gl.RGBA, lilgl.gl.UNSIGNED_BYTE, drawStoneWalkway());
    lilgl.gl.vertexAttrib1f(lilgl.textureDepth, 0);

    lilgl.gl.generateMipmap(lilgl.gl.TEXTURE_2D_ARRAY);
  }

  render(camera: Camera, scene: Object3d) {
    lilgl.gl.clearColor(0.3, 0.5, 1, 1);
    lilgl.gl.clear(lilgl.gl.COLOR_BUFFER_BIT | lilgl.gl.DEPTH_BUFFER_BIT);

    const viewMatrix = camera.worldMatrix.inverse();

    scene.allChildren().forEach(object3d => {
      if (object3d.isMesh()) {
        const modelViewMatrix = viewMatrix.multiply(object3d.worldMatrix);
        const modelViewProjectionMatrix = camera.projection.multiply(modelViewMatrix);
        lilgl.gl.uniform4fv(this.colorLocation, object3d.material.color);
        lilgl.gl.uniformMatrix4fv(this.normalMatrixLocation, true, modelViewMatrix.inverse().toFloat32Array());
        lilgl.gl.uniformMatrix4fv(this.modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
        lilgl.gl.bindVertexArray(object3d.geometry.vao!);
        lilgl.gl.drawElements(lilgl.gl.TRIANGLES, object3d.geometry.getIndices()!.length, lilgl.gl.UNSIGNED_SHORT, 0);
      }
    });
    lilgl.gl.bindVertexArray(null);
  }
}
