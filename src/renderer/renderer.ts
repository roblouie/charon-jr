import { lilgl } from "@/lil-gl";
import { Camera } from "@/renderer/camera";
import { Object3d } from "@/renderer/object-3d";

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