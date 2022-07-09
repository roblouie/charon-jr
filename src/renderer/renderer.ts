import { gl, lilgl } from "@/lil-gl";
import { Camera } from "@/renderer/camera";
import { Object3d } from "@/renderer/object-3d";

export class Renderer {
  modelviewProjectionLocation: WebGLUniformLocation;
  normalMatrixLocation: WebGLUniformLocation;
  colorLocation: WebGLUniformLocation;
  emissiveLocation: WebGLUniformLocation;
  textureRepeatLocation : WebGLUniformLocation;

  constructor() {
    gl.useProgram(lilgl.program);
    gl.enable(gl.CULL_FACE);
    gl.enable(lilgl.gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, 'modelviewProjection')!;
    this.normalMatrixLocation =  gl.getUniformLocation(lilgl.program, 'normalMatrix')!;
    this.colorLocation =  gl.getUniformLocation(lilgl.program, 'color')!;
    this.emissiveLocation = gl.getUniformLocation(lilgl.program, 'emissive')!;
    this.textureRepeatLocation = gl.getUniformLocation(lilgl.program, 'textureRepeat')!;
  }

  render(camera: Camera, scene: Object3d) {
    gl.clearColor(0.3, 0.5, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = camera.worldMatrix.inverse();

    const sceneTransparentLast = scene.allChildren().sort((a, b) => {
      if (a.isMesh()) {
        return a.material.isTransparent ? 1 : -1;
      }
      return 0;
    });

    sceneTransparentLast.forEach(object3d => {
      if (object3d.isMesh()) {
        if (object3d.material.isTransparent) {
          gl.depthMask(false);
        }
        const modelViewMatrix = viewMatrix.multiply(object3d.worldMatrix);
        const modelViewProjectionMatrix = camera.projection.multiply(modelViewMatrix);
        gl.uniform4fv(this.colorLocation, object3d.material.color);
        gl.vertexAttrib1f(lilgl.textureDepth, object3d.material.texture?.id ?? -1.0);
        const textureRepeat = [object3d.material.texture?.repeat.x ?? 1, object3d.material.texture?.repeat.y ?? 1];
        gl.uniform2fv(this.textureRepeatLocation, textureRepeat);
        gl.uniform4fv(this.emissiveLocation, object3d.material.emissive);
        gl.uniformMatrix4fv(this.normalMatrixLocation, true, object3d.worldMatrix.inverse().toFloat32Array());
        gl.uniformMatrix4fv(this.modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
        gl.bindVertexArray(object3d.geometry.vao!);
        gl.drawElements(gl.TRIANGLES, object3d.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
      }
    });
    gl.depthMask(true);
    gl.bindVertexArray(null);
  }
}
