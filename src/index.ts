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
import { Renderer } from "@/renderer/renderer";

// TESTING
const test = new EnhancedDOMPoint(1, 2, 3);
const test2 = new EnhancedDOMPoint(2, 3, 4);
// @ts-ignore
console.log(test2.minus(test));

const gl = lilgl.gl;
const debugElement = document.querySelector('#debug')!;

const scene = new Object3d();

const camera = new Camera(Math.PI / 5, 16 / 9, 1, 400);
camera.position = new EnhancedDOMPoint(3, 5, -17);

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

const renderer = new Renderer();

let lastTime = 0;
draw(0);

function draw(time: number) {
  // debugElement.textContent = `${1 / ((time - lastTime) / 1000)} fps`;
  // lastTime = time;
  player.update(groupedFaces);

  scene.updateWorldMatrix();

  camera.lookAt(player.mesh.position);
  camera.updateWorldMatrix();

  renderer.render(camera, scene);

  requestAnimationFrame(draw);
}
