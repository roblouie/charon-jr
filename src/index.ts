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
  drawMarble, drawParticle, drawSky,
  drawStoneWalkway, drawWater
} from '@/texture-creation/texture-maker';
import { textureLoader } from '@/renderer/texture-loader';
import { controls } from '@/core/controls';
import { ThirdPersonPlayer } from '@/third-person-player';

const debugElement = document.querySelector('#debug')!;

const scene = new Object3d();

const camera = new Camera(Math.PI / 5, 16 / 9, 1, 400);
camera.position = new EnhancedDOMPoint(0, 5, -17);

const player = new ThirdPersonPlayer(camera);
player.mesh.position.y = 1.5;

// player.mesh.add(camera);

const sampleHeightMap = [];
const imageData = drawLandscape().data;
for (let i = 0; i < imageData.length; i+= 4) {
  sampleHeightMap.push(imageData[i] / 10 - 10);
}
const floorTexture = textureLoader.load(drawGrass());
floorTexture.repeat.x = 1/10; floorTexture.repeat.y = 1/10;
const floor = new Mesh(
  new PlaneGeometry(200, 200, 127, 127, sampleHeightMap),
  new Material({texture: floorTexture})
);

const lakeTexture = textureLoader.load(drawWater());
lakeTexture.repeat.x = 6; lakeTexture.repeat.y = 6;
const lake = new Mesh(
  new PlaneGeometry(200, 200, 1, 1),
  new Material({texture: lakeTexture, isTransparent: true, color: '#fffc'})
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

const skyTexture = textureLoader.load(drawSky());
skyTexture.repeat.x = 1;
skyTexture.repeat.y = 1;
const sky = new Mesh(
  new CubeGeometry(400, 100, 400, 0),
  new Material({texture: skyTexture, emissive: '#fff'})
);

const particleGeometry = new PlaneGeometry(2, 2);
const particleTexture = textureLoader.load(drawParticle());
const particleMaterial = new Material({emissive: '#fff', texture: particleTexture, isTransparent: true});
const particle = new Mesh(
  particleGeometry,
  particleMaterial
);

const particle2 = new Mesh(
  particleGeometry,
  particleMaterial
);

particle.position.y += 5;
particle2.position.y += 4.5;

// TESTING
drawCurrentTexture();
// END TESTING

const levelParts = [ramp, ...cubes, wall, floor, lake];
const levelGeometries = levelParts.map(levelPart => levelPart.geometry);

const groupedFaces = getGroupedFaces(levelGeometries);
sky.geometry.getIndices()?.reverse();
levelParts.push(sky);
levelParts.push(particle);
levelParts.push(particle2);

scene.add(player.mesh);
scene.add(...levelParts);

scene.allChildren().forEach(child => {
  if (child.isMesh()) {
    child.geometry.bindGeometry();
  }
});

camera.lookAt(player.mesh.position);

const renderer = new Renderer();
textureLoader.bindTextures();

// let lastTime = 0;
draw(0);

function draw(time: number) {
  controls.queryController();
  // debugElement.textContent = `${1 / ((time - lastTime) / 1000)} fps`;
  // lastTime = time;
  player.update(groupedFaces);
  scene.updateWorldMatrix();

  const {x, y, z} = player.mesh.getMatrix().transformPoint(camera.position);
  particle.lookAt(new EnhancedDOMPoint(x, y, z));
  particle2.lookAt(new EnhancedDOMPoint(x, y, z));

  particle.rotate(-1, 0, 0);
  particle2.rotate(-1, 0, 0);

  renderer.render(camera, scene);

  requestAnimationFrame(draw);
}
