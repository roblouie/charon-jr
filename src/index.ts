import { lilgl } from './lil-gl';
import { Object3d } from './renderer/object-3d';
import { Camera } from './renderer/camera';
import { Player } from './player';
import { Mesh } from './renderer/mesh';
import { CubeGeometry } from './cube-geometry';
import { Material } from './renderer/material';
import { getGroupedFaces } from './physics/parse-faces';
import { PlaneGeometry } from './plane-geometry';
import { RampGeometry } from './ramp-geometry';
import { Staircase } from './staircase-geometry';
import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';

// TESTING
const test = new EnhancedDOMPoint([0, 1, 2, 3]);
// @ts-ignore
console.log(test.x);
// @ts-ignore
console.log(test.xy);
// @ts-ignore
console.log(test.zyx);

// END TESTING

const gl = lilgl.gl;
const debugElement = document.querySelector('#debug')!;

gl.useProgram(lilgl.program);

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

const modelviewProjectionLocation = gl.getUniformLocation(lilgl.program, 'modelviewProjection');
const normalMatrixLocation =  gl.getUniformLocation(lilgl.program, 'normalMatrix');
const colorLocation =  gl.getUniformLocation(lilgl.program, 'color');

const scene = new Object3d();

const camera = new Camera(Math.PI / 5, 16 / 9, 1, 400);
camera.position = new DOMPoint(3, 5, -17);

const player = new Player();
player.mesh.position.y = 1.5;

const floor = new Mesh(new PlaneGeometry(50, 50, 9, 9), new Material([0, 1, 0, 1]));
const ramp = new Mesh(new RampGeometry(3, 13, 13), new Material([1, 0, 0, 1]));
const { cubes } = new Staircase(10, 0.3, 3, 1);
const wall = new Mesh(new CubeGeometry(3, 4, 4, -6), new Material([1, 1, 0, 1]));

const levelParts = [ramp, ...cubes, wall, floor];
const levelGeometries = levelParts.map(levelPart => levelPart.geometry);

const groupedFaces = getGroupedFaces(levelGeometries);
console.log(groupedFaces);

scene.add(player.mesh);
scene.add(...levelParts);

scene.allChildren().forEach(child => {
  if (child.isMesh()) {
    child.geometry.bindGeometry();
  }
});

camera.lookAt(player.mesh.position);
camera.rotate(0, 0.2, 0);

draw(0);

function draw(time: number) {
  gl.clearColor(0.3, 0.5, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  player.update(groupedFaces);

  scene.updateWorldMatrix();
  camera.updateWorldMatrix();

  const viewMatrix = camera.worldMatrix.inverse();

  player.mesh.rotate(0, 0.0003, 0);

  camera.lookAt(player.mesh.position);

  scene.allChildren().forEach(object3d => {
    if (object3d.isMesh()) {
      const modelViewMatrix = viewMatrix.multiply(object3d.worldMatrix);
      const modelViewProjectionMatrix = camera.projection.multiply(modelViewMatrix);
      gl.uniform4fv(colorLocation, object3d.material.color);
      gl.uniformMatrix4fv(normalMatrixLocation, true, modelViewMatrix.inverse().toFloat32Array());
      gl.uniformMatrix4fv(modelviewProjectionLocation, false, modelViewProjectionMatrix.toFloat32Array());
      gl.bindVertexArray(object3d.geometry.vao!);
      gl.drawElements(gl.TRIANGLES, object3d.geometry.getIndices()!.length, gl.UNSIGNED_SHORT, 0);
    }
  });

  gl.bindVertexArray(null);
  requestAnimationFrame(draw);
}
