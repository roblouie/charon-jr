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
import {
  drawBricks,
  drawCurrentTexture,
  drawGrass,
  drawLandscape,
  drawMarble,
  drawStoneWalkway, drawWater
} from '@/textures/texture-maker';
import { textureLoader } from '@/renderer/texture-loader';
import { controls } from '@/core/controls';

const debugElement = document.querySelector('#debug')!;

const scene = new Object3d();

const camera = new Camera(Math.PI / 5, 16 / 9, 1, 400);
camera.position = new EnhancedDOMPoint(0, 5, -17);

const player = new Player();
player.mesh.position.y = 1.5;

player.mesh.add(camera);

const sampleHeightMap = [];
const imageData = drawLandscape().data;
for (let i = 0; i < imageData.length; i+= 4) {
  sampleHeightMap.push(imageData[i] / 10 - 10);
}
const floor = new Mesh(
  new PlaneGeometry(200, 200, 127, 127, sampleHeightMap),
  new Material({texture: textureLoader.load(drawGrass())})
);
const lake = new Mesh(
  new PlaneGeometry(200, 200, 50, 50),
  new Material({texture: textureLoader.load(drawWater())})
);

lake.position.y = -8.7 //-7.9;

const ramp = new Mesh(
  new RampGeometry(3, 13, 13),
  new Material({texture: textureLoader.load(drawMarble())})
);
const { cubes } = new Staircase(10, 0.3, 3, 1);

const wall = new Mesh(
  new CubeGeometry(3, 4, 4, -6),
  new Material({texture: textureLoader.load(drawBricks())})
);

// TESTING
drawCurrentTexture();
// END TESTING

const levelParts = [ramp, ...cubes, wall, floor, lake];
const levelGeometries = levelParts.map(levelPart => levelPart.geometry);

const groupedFaces = getGroupedFaces(levelGeometries);

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
textureLoader.bindTextures();

let lastTime = 0;
draw(0);

function draw(time: number) {
  controls.queryController();
  // debugElement.textContent = `${1 / ((time - lastTime) / 1000)} fps`;
  // lastTime = time;
  player.update(groupedFaces);

  scene.updateWorldMatrix();

  camera.updateWorldMatrix();
  // camera.lookAt(player.mesh.position);

  renderer.render(camera, scene);

  requestAnimationFrame(draw);
}
