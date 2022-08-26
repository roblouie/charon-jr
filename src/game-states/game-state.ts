import { State } from '@/core/state';
import { audioCtx, getAudioPlayer, panner } from '@/engine/audio/audio-player';
import { Skybox } from '@/skybox';
import {
  drawBricks, drawCurrentTexture,
  drawGrass,
  drawLandscape,
  drawMarble, drawParticle,
  drawSky,
  drawWater, materials, skyboxes,
} from '@/texture-maker';
import { Scene } from '@/engine/renderer/scene';
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { ThirdPersonPlayer } from '@/third-person-player';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { Material } from '@/engine/renderer/material';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { AttributeLocation, renderer } from '@/engine/renderer/renderer';
import { Staircase } from '@/staircase-geometry';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu-state';
import { Object3d } from '@/engine/renderer/object-3d';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { findFloorHeightAtPosition, getGridPosition } from '@/engine/physics/surface-collision';
import { doTimes } from '@/engine/helpers';
import { InstancedMesh } from '@/engine/renderer/instanced-mesh';
import { largeTree, leavesMesh, plant1 } from '@/modeling/flora.modeling';
import { Level } from '@/Level';
import { Spirit } from '@/spirit';


const sampleHeightMap = noiseMaker.noiseLandscape(256, 1 / 64, 3, NoiseType.Perlin, 100);
const level = new Level(
  sampleHeightMap,
  skyboxes.dayCloud,
  -47,
  39,
  26,
  materials.grass.texture!,
  materials.dirtPath.texture!,
  new EnhancedDOMPoint(907, -41, 148),
  new EnhancedDOMPoint(-940, 45, -85),
  new EnhancedDOMPoint(61, -26, -390),
);

const arrowGuide = new Mesh(new MoldableCubeGeometry(3, 3, 3), new Material({ color: '#fff' }));
const arrowGuideWrapper = new Object3d();
arrowGuide.position.y = 4.5;
arrowGuide.position.z = -10;
// arrowGuideWrapper.add(arrowGuide);

class GameState implements State {
  player: ThirdPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]};

  gridFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]}[];
  spirits: Spirit[] = [];

  constructor() {
    const camera = new Camera(Math.PI / 3, 16 / 9, 1, 400);
    camera.position = new EnhancedDOMPoint(0, 5, -17);
    camera.add(arrowGuide);
    this.player = new ThirdPersonPlayer(camera);
    this.scene = new Scene();
    this.gridFaces = [];
    this.groupedFaces = { floorFaces: [], wallFaces: [], ceilingFaces: [] }


    const rampGeometry = new MoldableCubeGeometry(16, 40, 40);
    rampGeometry
      .selectBy(vertex => {
        return vertex.y > 5 && vertex.z > 1;
      })
      .translate(0, -30)
      .computeNormalsPerPlane()
      .done();

    const ramp = new Mesh(rampGeometry, materials.marble);
    ramp.position.y += 8;
    ramp.updateWorldMatrix();

    function onlyUnique(value: any, index: number, array: any[]) {
      return array.indexOf(value) === index;
    }


    level.facesToCollideWith.floorFaces.forEach(face => {
      const gridPositions = face.points.map(getGridPosition);

      gridPositions.filter(onlyUnique).forEach(position => {
        if (!this.gridFaces[position]) {
          this.gridFaces[position] = { floorFaces: [], wallFaces: [], ceilingFaces: [] };
        }
        this.gridFaces[position].floorFaces.push(face);
      });
    });

    level.facesToCollideWith.wallFaces.forEach(face => {
      const gridPositions = face.points.map(getGridPosition);

      gridPositions.filter(onlyUnique).forEach(position => {
        if (!this.gridFaces[position]) {
          this.gridFaces[position] = { floorFaces: [], wallFaces: [], ceilingFaces: [] };
        }
        this.gridFaces[position].wallFaces.push(face);
      });
    });

    this.spirits = level.spiritPositions.map(position => new Spirit(position));

    const dropOffGeo = new MoldableCubeGeometry(1, 140, 1, 4, 1, 4).cylindrify(30).done();
    const redDropOffMesh = new Mesh(dropOffGeo, new Material({ color: '#f00c', emissive: '#f00c', isTransparent: true }));
    redDropOffMesh.position.set(level.redDropOff);

    const greenDropOffMesh = new Mesh(dropOffGeo, new Material({ color: '#0f0c', emissive: '#0f0c', isTransparent: true }));
    greenDropOffMesh.position.set(level.greenDropOff);

    const blueDropOffMesh = new Mesh(dropOffGeo, new Material({ color: '#00fc', emissive: '#00fc', isTransparent: true }));
    blueDropOffMesh.position.set(level.blueDropOff);

    this.scene.add(this.player.mesh, ...this.spirits, redDropOffMesh, greenDropOffMesh, blueDropOffMesh, arrowGuideWrapper, camera);
    this.scene.add(...level.meshesToRender);
  }

  onEnter() {
    this.player.mesh.position.y = 1.5;

    const soundPlayer = getAudioPlayer();

    this.scene.skybox = level.skybox
    this.scene.skybox.bindGeometry();

    const audio = soundPlayer(...[, , 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17] as const);

    // audio.loop = true;
    audio.connect(panner).connect(audioCtx.destination);
    // audio.start();



// @ts-ignore

  }

  private spiritPlayerDistance = new EnhancedDOMPoint();
  private dropOffPlayerDistance = new EnhancedDOMPoint();
  handleDropOffPickUp() {
    if (this.player.isCarryingSpirit) {
      if (this.player.velocity.magnitude < 0.1) {
        const carriedSpirit = this.spirits[this.player.carriedSpiritIndex];
        const dropOffPosition = level[carriedSpirit.dropOffPoint];
        this.dropOffPlayerDistance.subtractVectors(dropOffPosition, this.player.chassisCenter);
        if (Math.abs(this.dropOffPlayerDistance.x) <= 30 && Math.abs(this.dropOffPlayerDistance.z) <= 30) {
          console.log('DROPPED OFF!');
          carriedSpirit.position.set(this.player.chassisCenter);
          this.player.mesh.wrapper.remove(carriedSpirit);
          this.scene.add(carriedSpirit);
          this.player.isCarryingSpirit = false;
        }
      }
    }
    else {
      if (this.player.velocity.magnitude < 0.1) {
        level.spiritPositions.some((spiritPosition, index) => {
          this.spiritPlayerDistance.subtractVectors(spiritPosition, this.player.chassisCenter)
          if (Math.abs(this.spiritPlayerDistance.x) < 3 && Math.abs(this.spiritPlayerDistance.z) < 3) {
            this.spirits[index].position.set(0, 0, -2);
            this.player.mesh.wrapper.add(this.spirits[index]);
            this.player.isCarryingSpirit = true;
            this.player.carriedSpiritIndex = index;
            return true;
          }
        });
      }
    }
  }

  onUpdate(timeElapsed: number): void {
    this.player.update(this.gridFaces);
    this.handleDropOffPickUp();
    // particle.lookAt(this.player.camera.position);
    // particle2.lookAt(this.player.camera.position);
    // particle.rotate(-1, 0, 0);
    // particle2.rotate(-1, 0, 0);

    if (this.player.isCarryingSpirit) {
      arrowGuide.lookAt(level[this.spirits[this.player.carriedSpiritIndex].dropOffPoint]);
    }

    this.scene.updateWorldMatrix();


    renderer.render(this.player.camera, this.scene);

    if (controls.isEscape) {
      getGameStateMachine().setState(menuState);
    }
  }
}

export const gameState = new GameState();
