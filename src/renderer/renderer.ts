import { gl, lilgl } from "@/lil-gl";
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
    gl.useProgram(lilgl.program);
    gl.enable(gl.CULL_FACE);
    gl.enable(lilgl.gl.DEPTH_TEST);
    this.modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, 'modelviewProjection')!;
    this.normalMatrixLocation =  gl.getUniformLocation(lilgl.program, 'normalMatrix')!;
    this.colorLocation =  gl.getUniformLocation(lilgl.program, 'color')!;

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // const texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    // gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 8, gl.RGBA8, 128, 128, 3);
    //
    // gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, drawBricks());
    // gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 1, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, drawGrass());
    // gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 2, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, drawStoneWalkway());
    //
    // gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  }

  render(camera: Camera, scene: Object3d) {
    gl.clearColor(0.3, 0.5, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = camera.worldMatrix.inverse();

    scene.allChildren().forEach(object3d => {
      if (object3d.isMesh()) {
        const modelViewMatrix = viewMatrix.multiply(object3d.worldMatrix);
        const modelViewProjectionMatrix = camera.projection.multiply(modelViewMatrix);
        gl.uniform4fv(this.colorLocation, object3d.material.color);
        gl.vertexAttrib1f(lilgl.textureDepth, object3d.material.texture?.id ?? -1.0);
        gl.uniformMatrix4fv(this.normalMatrixLocation, true, modelViewMatrix.inverse().toFloat32Array());
        gl.uniformMatrix4fv(this.modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
        gl.bindVertexArray(object3d.geometry.vao!);
        gl.drawElements(gl.TRIANGLES, object3d.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
      }
    });
    gl.bindVertexArray(null);
  }
}
