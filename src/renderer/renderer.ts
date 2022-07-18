import { gl, lilgl } from "@/renderer/lil-gl";
import { Camera } from "@/renderer/camera";
import { Skybox } from '@/skybox';
import {
  COLOR,
  EMISSIVE,
  MODELVIEWPROJECTION,
  NORMALMATRIX,
  TEXTUREREPEAT,
  U_SKYBOX,
  U_VIEWDIRECTIONPROJECTIONINVERSE,
} from '@/shaders/shaders';
import { Scene } from '@/renderer/scene';
import { Mesh } from '@/renderer/mesh';

// IMPORTANT! The index of a given buffer in the buffer array must match it's respective data location in the shader.
// This allows us to use the index while looping through buffers to bind the attributes. So setting a buffer
// happens by placing
export enum AttributeLocation {
  Positions,
  Normals,
  TextureCoords,
  TextureDepth,
}

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
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, MODELVIEWPROJECTION)!;
    this.normalMatrixLocation =  gl.getUniformLocation(lilgl.program, NORMALMATRIX)!;
    this.colorLocation =  gl.getUniformLocation(lilgl.program, COLOR)!;
    this.emissiveLocation = gl.getUniformLocation(lilgl.program, EMISSIVE)!;
    this.textureRepeatLocation = gl.getUniformLocation(lilgl.program, TEXTUREREPEAT)!;
    this.skyboxLocation = gl.getUniformLocation(lilgl.skyboxProgram, U_SKYBOX)!;
    this.viewDirectionProjectionInverseLocation = gl.getUniformLocation(lilgl.skyboxProgram, U_VIEWDIRECTIONPROJECTIONINVERSE)!;
  }

  render(camera: Camera, scene: Scene) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = camera.worldMatrix.inverse();
    const viewMatrixCopy = viewMatrix.scale(1, 1, 1);
    const viewProjectionMatrix = camera.projection.multiply(viewMatrix);

    const renderSkybox = (skybox: Skybox) => {
      gl.useProgram(lilgl.skyboxProgram);
      gl.uniform1i(this.skyboxLocation, 0);
      viewMatrixCopy.m41 = 0;
      viewMatrixCopy.m42 = 0;
      viewMatrixCopy.m43 = 0;
      const inverseViewProjection = camera.projection.multiply(viewMatrixCopy).inverse();
      gl.uniformMatrix4fv(this.viewDirectionProjectionInverseLocation, false, inverseViewProjection.toFloat32Array());
      gl.bindVertexArray(skybox.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const renderMesh = (mesh: Mesh) => {
      gl.useProgram(lilgl.program);
      const modelViewProjectionMatrix = viewProjectionMatrix.multiply(mesh.worldMatrix)
      gl.uniform4fv(this.colorLocation, mesh.material.color);
      gl.vertexAttrib1f(AttributeLocation.TextureDepth, mesh.material.texture?.id ?? -1.0);
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

    // Set the depthFunc to less than or equal so the skybox can be drawn at the absolute farthest depth. Without
    // this the skybox will be at the draw distance and so not drawn. After drawing set this back.
    gl.depthFunc(gl.LEQUAL);
    renderSkybox(scene.skybox!);
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
