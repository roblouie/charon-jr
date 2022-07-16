import { gl, lilgl } from "@/lil-gl";
import { Camera } from "@/renderer/camera";
import { Skybox } from '@/skybox';
import {
  COLOR,
  EMISSIVE, ISSKYBOX,
  MODELVIEWPROJECTION,
  NORMALMATRIX,
  TEXTUREREPEAT,
  U_SKYBOX,
  U_VIEWDIRECTIONPROJECTIONINVERSE,
} from '@/shaders/shaders';
import { Scene } from '@/scene';
import { Mesh } from '@/renderer/mesh';

export class Renderer {
  modelviewProjectionLocation: WebGLUniformLocation;
  normalMatrixLocation: WebGLUniformLocation;
  colorLocation: WebGLUniformLocation;
  emissiveLocation: WebGLUniformLocation;
  textureRepeatLocation : WebGLUniformLocation;
  skyboxLocation: WebGLUniformLocation;
  viewDirectionProjectionInverseLocation: WebGLUniformLocation;

  constructor() {
    gl.enable(gl.CULL_FACE);
    gl.enable(lilgl.gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, MODELVIEWPROJECTION)!;
    this.normalMatrixLocation =  gl.getUniformLocation(lilgl.program, NORMALMATRIX)!;
    this.colorLocation =  gl.getUniformLocation(lilgl.program, COLOR)!;
    this.emissiveLocation = gl.getUniformLocation(lilgl.program, EMISSIVE)!;
    this.textureRepeatLocation = gl.getUniformLocation(lilgl.program, TEXTUREREPEAT)!;
    this.skyboxLocation = gl.getUniformLocation(lilgl.program, U_SKYBOX)!;
    this.viewDirectionProjectionInverseLocation = gl.getUniformLocation(lilgl.program, U_VIEWDIRECTIONPROJECTIONINVERSE)!;
    gl.useProgram(lilgl.program);
  }

  render(camera: Camera, scene: Scene) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(lilgl.program);

    const viewMatrix = camera.worldMatrix.inverse();
    const viewMatrixCopy = viewMatrix.scale(1, 1, 1);
    const isSkybox = gl.getUniformLocation(lilgl.program, ISSKYBOX);
    const viewProjectionMatrix = camera.projection.multiply(viewMatrix);

    const renderSkybox = (skybox: Skybox) => {
      viewMatrixCopy.m41 = 0;
      viewMatrixCopy.m42 = 0;
      viewMatrixCopy.m43 = 0;
      const inverseViewProjection = camera.projection.multiply(viewMatrixCopy).inverse();
      gl.uniformMatrix4fv(this.viewDirectionProjectionInverseLocation, false, inverseViewProjection.toFloat32Array());
      gl.bindVertexArray(skybox.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const renderMesh = (mesh: Mesh) => {
      const modelViewProjectionMatrix = viewProjectionMatrix.multiply(mesh.worldMatrix)
      gl.uniform4fv(this.colorLocation, mesh.material.color);
      gl.vertexAttrib1f(lilgl.textureDepth, mesh.material.texture?.id ?? -1.0);
      const textureRepeat = [mesh.material.texture?.repeat.x ?? 1, mesh.material.texture?.repeat.y ?? 1];
      gl.uniform2fv(this.textureRepeatLocation, textureRepeat);
      gl.uniform4fv(this.emissiveLocation, mesh.material.emissive);
      gl.uniformMatrix4fv(this.normalMatrixLocation, true, mesh.worldMatrix.inverse().toFloat32Array());
      gl.uniformMatrix4fv(this.modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
      gl.bindVertexArray(mesh.geometry.vao!);
      gl.drawElements(gl.TRIANGLES, mesh.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
    }

    // Render solid meshes first
    scene.solidMeshes.forEach(renderMesh);

    // Then render the skybox. Set the boolean for isSkybox to true so the shader handles it properly, then call
    // the skybox render method. After rendering the skybox, set the boolean back to false.
    // Also set the depthFunc to less than or equal so the skybox can be drawn at the absolute farthest depth. Without
    // this the skybox will be at the draw distance and so not drawn. After drawing set this back.
    gl.uniform1i(isSkybox, 1);
    gl.depthFunc(gl.LEQUAL);
    renderSkybox(scene.skybox!);
    gl.uniform1i(isSkybox, 0);
    gl.depthFunc(gl.LESS);

    // Now render transparent items. For transparent items, stop writing to the depth mask. If we don't do this
    // the transparent portion of a transparent mesh will hide other transparent items. After rendering the
    // transparent items, set the depth mask back to writable.
    gl.depthMask(false);
    scene.transparentMeshes.forEach(renderMesh);
    gl.depthMask(true);

    // Unbinding the vertex array being used to make sure the last item drawn isn't still bound on the next draw call.
    // In theory this isn't necessary but avoids bugs.
    gl.bindVertexArray(null);
  }
}
