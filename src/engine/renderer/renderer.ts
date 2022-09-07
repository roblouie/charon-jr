import { gl, lilgl } from "@/engine/renderer/lil-gl";
import { Camera } from "@/engine/renderer/camera";
import { Skybox } from '@/skybox';
import {
  COLOR,
  EMISSIVE,
  MODELVIEWPROJECTION,
  NORMALMATRIX,
  TEXTUREREPEAT,
  U_SKYBOX,
  U_VIEWDIRECTIONPROJECTIONINVERSE, VIEWPROJECTION,
} from '@/engine/shaders/shaders';
import { Scene } from '@/engine/renderer/scene';
import { Mesh } from '@/engine/renderer/mesh';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { InstancedMesh } from '@/engine/renderer/instanced-mesh';

// IMPORTANT! The index of a given buffer in the buffer array must match it's respective data location in the shader.
// This allows us to use the index while looping through buffers to bind the attributes. So setting a buffer
// happens by placing
export const enum AttributeLocation {
  Positions,
  Normals,
  TextureCoords,
  TextureDepth,
  LocalMatrix,
  NormalMatrix = 8,
}

// Possibly change this from a class to just a function, it's just setup and a single method
export class Renderer {
  modelviewProjectionLocation: WebGLUniformLocation;
  normalMatrixLocation: WebGLUniformLocation;
  colorLocation: WebGLUniformLocation;
  emissiveLocation: WebGLUniformLocation;
  textureRepeatLocation : WebGLUniformLocation;
  skyboxLocation: WebGLUniformLocation;
  viewDirectionProjectionInverseLocation: WebGLUniformLocation;

  viewProjectionLocation: WebGLUniformLocation;

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
    this.viewProjectionLocation = gl.getUniformLocation(lilgl.instancedProgram, VIEWPROJECTION)!;
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

    const instancedColorLocation = gl.getUniformLocation(lilgl.instancedProgram, COLOR)!;
    const instancedEmissiveLocation = gl.getUniformLocation(lilgl.instancedProgram, EMISSIVE)!;
    const instancedNormalMatrixLocation = gl.getUniformLocation(lilgl.instancedProgram, NORMALMATRIX);
    const textureRepeatLocation = gl.getUniformLocation(lilgl.instancedProgram, TEXTUREREPEAT);

    const renderMesh = (mesh: Mesh | InstancedMesh) => {
      const isInstancedMesh = Mesh.isInstanced(mesh);
      gl.useProgram(isInstancedMesh ? lilgl.instancedProgram : lilgl.program);
      const modelViewProjectionMatrix = viewProjectionMatrix.multiply(mesh.worldMatrix);

      // In order to avoid having to generate mipmaps for every animation frame, animated textures have mipmaps disabled
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, mesh.material.texture?.animationFunction ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR);

      gl.uniform4fv(isInstancedMesh ? instancedColorLocation : this.colorLocation, mesh.material.color);
      gl.uniform4fv(isInstancedMesh ? instancedEmissiveLocation : this.emissiveLocation, mesh.material.emissive);
      gl.vertexAttrib1f(AttributeLocation.TextureDepth, mesh.material.texture?.id ?? -1.0);
      const textureRepeat = [mesh.material.texture?.repeat.x ?? 1, mesh.material.texture?.repeat.y ?? 1];
      gl.uniform2fv(isInstancedMesh ? textureRepeatLocation : this.textureRepeatLocation, textureRepeat);

      gl.bindVertexArray(mesh.geometry.vao!);

      if (isInstancedMesh) {
        gl.uniformMatrix4fv(this.viewProjectionLocation, false, viewProjectionMatrix.toFloat32Array());
        gl.drawElementsInstanced(gl.TRIANGLES, mesh.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0, mesh.count);
      } else {
        gl.uniformMatrix4fv(this.normalMatrixLocation, true, mesh.worldMatrix.inverse().toFloat32Array());
        gl.uniformMatrix4fv(this.modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
        gl.drawElements(gl.TRIANGLES, mesh.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
      }
    }

    // Render solid meshes first
    scene.solidMeshes.forEach(renderMesh);

    // Set the depthFunc to less than or equal so the skybox can be drawn at the absolute farthest depth. Without
    // this the skybox will be at the draw distance and so not drawn. After drawing set this back.
    if (scene.skybox) {
      gl.depthFunc(gl.LEQUAL);
      renderSkybox(scene.skybox!);
      gl.depthFunc(gl.LESS);
    }

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

export const renderer = new Renderer();
