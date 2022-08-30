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
import { drawEngine } from '@/core/draw-engine';
import { levelOverState } from '@/game-states/level-over-state';

const arrowGuideGeo = new MoldableCubeGeometry(2, 0.3, 5)
  .selectBy(vertex => vertex.z < 0)
  .scale(0, 1, 0)
  .merge(new MoldableCubeGeometry(1, 0.3, 2.5).selectBy(vertex => vertex.z < 0).scale(0.6, 1, 1).all().translate(0, 0, 3.5).done())
  .computeNormalsPerPlane()
  .done();

class GameState implements State {
  player: ThirdPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]};

  gridFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]}[];
  spirits: Spirit[] = [];

  arrowGuideWrapper: Object3d;
  arrowGuide: Mesh;

  timeRemaining = 0;
  private readonly initialTimeRemaining = 150;
  private readonly initialTimeReductionPerDropOff = 0.001;
  private timePerDistanceUnit = 0.023;
  private timeReductionPerDropOff = 0.001;
  private minimumTimePerDistanceUnit = 0.012;

  spiritsTransported = 0;
  score = 0;

  currentLevel: Level

  constructor() {
    const camera = new Camera(Math.PI / 2, 16 / 9, 1, 700);
    camera.position = new EnhancedDOMPoint(0, 5, -17);
    this.player = new ThirdPersonPlayer(camera);
    this.scene = new Scene();
    this.gridFaces = [];
    this.groupedFaces = { floorFaces: [], wallFaces: [], ceilingFaces: [] }

    const arrowMaterial = new Material();
    arrowMaterial.color = [1.7, 1.7, 1.7, 1];
    this.arrowGuide = new Mesh(arrowGuideGeo, arrowMaterial);
    this.arrowGuideWrapper = new Object3d(this.arrowGuide);

    this.currentLevel = {} as Level;

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
  }

  onEnter(levelNumber: 0 | 1 | 2) {
    if (levelNumber === 0) {
      noiseMaker.seed(2);
      const sampleHeightMap = noiseMaker.noiseLandscape(256, 1 / 64, 3, NoiseType.Perlin, 100);
      this.currentLevel = new Level(
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
    } else if (levelNumber === 1) {
      noiseMaker.seed(35);
      const sampleHeightMap2 = noiseMaker.noiseLandscape(256, 1 / 128, 4, NoiseType.Perlin, 200);
      this.currentLevel = new Level(
        sampleHeightMap2,
        skyboxes.purpleCloud,
        -47,
        39,
        26,
        materials.grass.texture!,
        materials.dirtPath.texture!,
        new EnhancedDOMPoint(907, -41, 148),
        new EnhancedDOMPoint(-940, 45, -85),
        new EnhancedDOMPoint(61, -26, -390),
      );
    } else {
      noiseMaker.seed(21);
      const sampleHeightMap3 = noiseMaker.noiseLandscape(256, 1 / 128, 4, NoiseType.Perlin, 200);
      this.currentLevel = new Level(
        sampleHeightMap3,
        skyboxes.purpleCloud,
        -47,
        39,
        26,
        materials.grass.texture!,
        materials.dirtPath.texture!,
        new EnhancedDOMPoint(907, -41, 148),
        new EnhancedDOMPoint(-940, 45, -85),
        new EnhancedDOMPoint(61, -26, -390),
      );
    }

    this.player.mesh.position.y = 1.5;
    this.player.isCarryingSpirit = false;
    this.spirits = this.currentLevel.spiritPositions.map(position => new Spirit(position));

    this.scene = new Scene();

    function onlyUnique(value: any, index: number, array: any[]) {
      return array.indexOf(value) === index;
    }

    this.currentLevel.facesToCollideWith.floorFaces.forEach(face => {
      const gridPositions = face.points.map(getGridPosition);

      gridPositions.filter(onlyUnique).forEach(position => {
        if (!this.gridFaces[position]) {
          this.gridFaces[position] = { floorFaces: [], wallFaces: [], ceilingFaces: [] };
        }
        this.gridFaces[position].floorFaces.push(face);
      });
    });

    this.currentLevel.facesToCollideWith.wallFaces.forEach(face => {
      const gridPositions = face.points.map(getGridPosition);

      gridPositions.filter(onlyUnique).forEach(position => {
        if (!this.gridFaces[position]) {
          this.gridFaces[position] = { floorFaces: [], wallFaces: [], ceilingFaces: [] };
        }
        this.gridFaces[position].wallFaces.push(face);
      });
    });

    const dropOffGeo = new MoldableCubeGeometry(1, 140, 1, 4, 1, 4).cylindrify(30).done();
    const redDropOffMesh = new Mesh(dropOffGeo, new Material({ color: '#f00c', emissive: '#f00c', isTransparent: true }));
    redDropOffMesh.position.set(this.currentLevel.redDropOff);

    const greenDropOffMesh = new Mesh(dropOffGeo, new Material({ color: '#0f0c', emissive: '#0f0c', isTransparent: true }));
    greenDropOffMesh.position.set(this.currentLevel.greenDropOff);

    const blueDropOffMesh = new Mesh(dropOffGeo, new Material({ color: '#00fc', emissive: '#00fc', isTransparent: true }));
    blueDropOffMesh.position.set(this.currentLevel.blueDropOff);

    this.scene.add(this.player.mesh, ...this.spirits, redDropOffMesh, greenDropOffMesh, blueDropOffMesh);
    this.scene.add(...this.currentLevel.meshesToRender);



    const soundPlayer = getAudioPlayer();

    this.scene.skybox = this.currentLevel.skybox;
    this.scene.skybox.bindGeometry();

    const audio = soundPlayer(...[, , 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17] as const);

    // audio.loop = true;
    audio.connect(panner).connect(audioCtx.destination);
    // audio.start();


    this.timeRemaining = this.initialTimeRemaining;
    this.timeReductionPerDropOff = this.initialTimeReductionPerDropOff;
    this.spiritsTransported = 0;
    this.score = 0;
  }

  onLeave() {
    drawEngine.clear();
  }

  private spiritPlayerDistance = new EnhancedDOMPoint();
  private dropOffPlayerDistance = new EnhancedDOMPoint();
  private spiritDropOffDistance = new EnhancedDOMPoint();

  handleDropOffPickUp() {

    // Drop Off
    if (this.player.isCarryingSpirit) {
      if (this.player.velocity.magnitude < 0.1) {
        const carriedSpirit = this.spirits[this.player.carriedSpiritIndex];
        const dropOffPosition = this.currentLevel[carriedSpirit.dropOffPoint];
        this.dropOffPlayerDistance.subtractVectors(dropOffPosition, this.player.chassisCenter);
        if (Math.abs(this.dropOffPlayerDistance.x) <= 30 && Math.abs(this.dropOffPlayerDistance.z) <= 30) {

          // Less buffer is given after each drop off, down until the exact time it takes
          if (this.timePerDistanceUnit >= this.minimumTimePerDistanceUnit) {
            this.timePerDistanceUnit -= this.timeReductionPerDropOff;
          }

          carriedSpirit.position.set(this.player.chassisCenter);
          this.player.mesh.wrapper.remove(carriedSpirit);
          this.scene.add(carriedSpirit);
          this.scene.remove(this.arrowGuideWrapper);
          this.scene.remove(this.arrowGuide)
          this.player.isCarryingSpirit = false;

          this.spiritsTransported++;
          this.score += 10; // TODO: Make this a real value
        }
      }
    }
    else {
      // Pick Up
      if (this.player.velocity.magnitude < 0.1) {
        this.currentLevel.spiritPositions.some((spiritPosition, index) => {
          this.spiritPlayerDistance.subtractVectors(spiritPosition, this.player.chassisCenter)
          if (Math.abs(this.spiritPlayerDistance.x) < 15 && Math.abs(this.spiritPlayerDistance.z) < 15) {
            const spirit = this.spirits[index];
            const spiritPosition = spirit.position;

            // Find distance from spirit pickup point to it's drop off point and add a relative amount of time
            this.spiritDropOffDistance.subtractVectors(this.currentLevel[spirit.dropOffPoint], spiritPosition);
            this.spiritDropOffDistance.y = 0;
            this.timeRemaining += (this.spiritDropOffDistance.magnitude * this.timePerDistanceUnit);

            spiritPosition.set(0, 0, -2);
            this.player.mesh.wrapper.add(spirit);
            this.player.isCarryingSpirit = true;
            this.player.carriedSpiritIndex = index;
            this.scene.add(this.arrowGuideWrapper);
            this.arrowGuide.material.color = spirit.material.color.map(val => val * 1.5);
            return true;
          }
        });
      }
    }
  }

  testLookAt = new EnhancedDOMPoint();
  onUpdate(timeElapsed: number): void {
    this.timeRemaining -= (timeElapsed / 1000);

    drawEngine.clear();
    drawEngine.drawText(this.timeRemaining.toFixed(1), 'bold italic 70px Times New Roman, serif-black', 110, 90, 2);

    this.player.update(this.gridFaces);
    this.handleDropOffPickUp();
    // particle.lookAt(this.player.camera.position);
    // particle2.lookAt(this.player.camera.position);
    // particle.rotate(-1, 0, 0);
    // particle2.rotate(-1, 0, 0);

    if (this.player.isCarryingSpirit) {
      this.arrowGuideWrapper.position.set(this.player.chassisCenter);
      this.arrowGuideWrapper.position.y += 14;
      this.testLookAt = this.currentLevel[this.spirits[this.player.carriedSpiritIndex].dropOffPoint];
      this.testLookAt.y = this.arrowGuideWrapper.position.y - 10;
      this.arrowGuideWrapper.lookAt(this.testLookAt);
    }


    this.scene.updateWorldMatrix();


    renderer.render(this.player.camera, this.scene);

    if (controls.isEscape) {
      getGameStateMachine().setState(menuState);
    }

    if (this.timeRemaining <= 0) {
      getGameStateMachine().setState(levelOverState, this.spiritsTransported, this.score);
    }
  }
}

export const gameState = new GameState();
