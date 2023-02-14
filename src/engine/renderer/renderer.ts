import { gl, lilgl } from "@/engine/renderer/lil-gl";
import { Camera } from "@/engine/renderer/camera";
import { Skybox } from '@/engine/skybox';
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

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
const modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, MODELVIEWPROJECTION)!;
const normalMatrixLocation =  gl.getUniformLocation(lilgl.program, NORMALMATRIX)!;
const colorLocation =  gl.getUniformLocation(lilgl.program, COLOR)!;
const emissiveLocation = gl.getUniformLocation(lilgl.program, EMISSIVE)!;
const textureRepeatLocation = gl.getUniformLocation(lilgl.program, TEXTUREREPEAT)!;
const skyboxLocation = gl.getUniformLocation(lilgl.skyboxProgram, U_SKYBOX)!;
const viewDirectionProjectionInverseLocation = gl.getUniformLocation(lilgl.skyboxProgram, U_VIEWDIRECTIONPROJECTIONINVERSE)!;
const viewProjectionLocation = gl.getUniformLocation(lilgl.instancedProgram, VIEWPROJECTION)!;
const instancedColorLocation = gl.getUniformLocation(lilgl.instancedProgram, COLOR)!;
const instancedEmissiveLocation = gl.getUniformLocation(lilgl.instancedProgram, EMISSIVE)!;
const instancedTextureRepeatLocation = gl.getUniformLocation(lilgl.instancedProgram, TEXTUREREPEAT);

export function render(camera: Camera, scene: Scene) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const viewMatrix = camera.worldMatrix.inverse();
  const viewMatrixCopy = viewMatrix.scale(1, 1, 1);
  const viewProjectionMatrix = camera.projection.multiply(viewMatrix);

  const renderSkybox = (skybox: Skybox) => {
    gl.useProgram(lilgl.skyboxProgram);
    gl.uniform1i(skyboxLocation, 0);
    viewMatrixCopy.m41 = 0;
    viewMatrixCopy.m42 = 0;
    viewMatrixCopy.m43 = 0;
    const inverseViewProjection = camera.projection.multiply(viewMatrixCopy).inverse();
    gl.uniformMatrix4fv(viewDirectionProjectionInverseLocation, false, inverseViewProjection.toFloat32Array());
    gl.bindVertexArray(skybox.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  const renderMesh = (mesh: Mesh | InstancedMesh) => {
    // @ts-ignore
    const isInstancedMesh = mesh.count !== undefined;
    gl.useProgram(isInstancedMesh ? lilgl.instancedProgram : lilgl.program);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const modelViewProjectionMatrix = viewProjectionMatrix.multiply(mesh.worldMatrix);

    gl.uniform4fv(isInstancedMesh ? instancedColorLocation : colorLocation, mesh.material.color);
    gl.uniform4fv(isInstancedMesh ? instancedEmissiveLocation : emissiveLocation, mesh.material.emissive);
    gl.vertexAttrib1f(AttributeLocation.TextureDepth, mesh.material.texture?.id ?? -1.0);
    const textureRepeat = [mesh.material.texture?.textureRepeat.x ?? 1, mesh.material.texture?.textureRepeat.y ?? 1];
    gl.uniform2fv(isInstancedMesh ? instancedTextureRepeatLocation : textureRepeatLocation, textureRepeat);

    gl.bindVertexArray(mesh.geometry.vao!);

    if (isInstancedMesh) {
      gl.uniformMatrix4fv(viewProjectionLocation, false, viewProjectionMatrix.toFloat32Array());
      // @ts-ignore
      gl.drawElementsInstanced(gl.TRIANGLES, mesh.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0, mesh.count);
    } else {
      // @ts-ignore
      gl.uniformMatrix4fv(normalMatrixLocation, true, mesh.color ? mesh.cachedMatrixData : mesh.worldMatrix.inverse().toFloat32Array());
      gl.uniformMatrix4fv(modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
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
  // gl.bindVertexArray(null);
}
