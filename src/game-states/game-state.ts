import { State } from '@/core/state';
import {
  audioCtx,
  drivingThroughWaterAudio,
  engineAudio,
  ghostFlyAwayAudio,
  ghostThankYouAudio
} from '@/engine/audio/audio-player';
import {
  drawEarthSky, materials, createSkybox, drawPurgatorySky, drawSkyPurple,
} from '@/texture-maker';
import { Scene } from '@/engine/renderer/scene';
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { ThirdPersonPlayer } from '@/third-person-player';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { renderer } from '@/engine/renderer/renderer';
import { Face } from '@/engine/physics/face';
import { getGameStateMachine } from '@/game-state-machine';
import { Object3d } from '@/engine/renderer/object-3d';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { getGridPosition } from '@/engine/physics/surface-collision';
import { clamp } from '@/engine/helpers';
import { Level } from '@/Level';
import { makeDynamicBody, Spirit } from '@/spirit';
import { draw2dEngine } from '@/core/draw2d-engine';
import { hud } from '@/hud';
import { gameStates } from '@/index';

const arrowGuideGeo = new MoldableCubeGeometry(2, 0.3, 5)
  .selectBy(vertex => vertex.z < 0)
  .scale(0, 1, 0)
  .merge(new MoldableCubeGeometry(1, 0.3, 2.5).selectBy(vertex => vertex.z < 0).scale(0.6, 1, 1).all().translate(0, 0, 3.5).done())
  .computeNormalsPerPlane()
  .done();

export class GameState implements State {
  player: ThirdPersonPlayer;
  scene: Scene;
  groupedFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]};

  gridFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]}[];
  spirits: Spirit[] = [];

  arrowGuideWrapper: Object3d;
  arrowGuide: Mesh;

  private timePerDistanceUnit = 0.015;

  spiritsTransported = 0;
  currentLevel: Level;

  dynamicBody: Object3d;

  dropoffs: Mesh[];

  constructor() {
    const camera = new Camera(1.68, 16 / 9, 1, 1000);
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
    this.dynamicBody = makeDynamicBody();
    this.dynamicBody.position.set(-10000, -10000, -10000);
    this.dropoffs = [];
  }

  private levelNumber = 0;
  private isLoaded = false;
  onEnter(levelNumber: 0 | 1 | 2) {
    this.gridFaces = [];
    this.groupedFaces = { floorFaces: [], wallFaces: [], ceilingFaces: [] }
    this.levelNumber = levelNumber;
    if (levelNumber === 0) {
      noiseMaker.seed(22);
      const sampleHeightMap = noiseMaker.noiseLandscape(256, 1 / 64, 3, NoiseType.Perlin, 80);
      this.currentLevel = new Level(
        sampleHeightMap,
        createSkybox(drawEarthSky),
        -47,
        39,
        26,
        materials.grass,
        materials.dirtPath,
        true,
        materials.grass,
        materials.marble,
        materials.lake,
        materials.wood,
        new EnhancedDOMPoint(907, -41, 148),
        new EnhancedDOMPoint(-940, 45, -85),
        new EnhancedDOMPoint(61, -26, -390),
        new EnhancedDOMPoint(-556, 26, -760),
        []
      );
    } else if (levelNumber === 1) {
      noiseMaker.seed(75);
      const sampleHeightMap2 = noiseMaker.noiseLandscape(256, 1 / 64, 2, NoiseType.Perlin, 30)
        .map(val => {
          if (val > 0) {
            return val + 40;
          }
          else if (val > 1) {
            return val + 50;
          } else {
            return val;
          }
        })
        .map(val => clamp(val, -50, 50));
      this.currentLevel = new Level(
        sampleHeightMap2,
        createSkybox(drawPurgatorySky),
        -10000,
        undefined,
        4,
        materials.purgatoryFloor,
        undefined,
        false,
        materials.purgatoryGrass,
        materials.purgatoryRocks,
        materials.lake,
        materials.wood,
        new EnhancedDOMPoint(-331, 50, -553),
        new EnhancedDOMPoint(700, -1.3, -765),
        new EnhancedDOMPoint(700, -7, 770),
        new EnhancedDOMPoint(-706, 50, 259),
        [
          {
            position: new EnhancedDOMPoint(252, -7.5 + 5.5, 117),
            rotation: 1.6,
          },
          {
            position: new EnhancedDOMPoint(685, -7.5 + 5.5, -60),
            rotation: 2.59,
          },
          {
            position: new EnhancedDOMPoint(148, -3.7 + 5.5, -371),
            rotation: 5.6,
          },
          {
            position: new EnhancedDOMPoint(-455, -9 + 5.5, 419),
            rotation: -2,
          },
          {
            position: new EnhancedDOMPoint(32, 41 + 5.5, 237),
            rotation: -1.8,
          },
          {
            position: new EnhancedDOMPoint(692, -7 + 5.5, -333),
            rotation: 6.23,
          },
          {
            position: new EnhancedDOMPoint(-223, 41 + 5.5, 55),
            rotation: -3.7,
          },
          {
            position: new EnhancedDOMPoint(475, 49 + 5.5, 400),
            rotation: 0.7,
          },
          {
            position: new EnhancedDOMPoint(-630, -11.5 + 5.5, -291),
            rotation: 8.2,
          },
          {
            position: new EnhancedDOMPoint(876, 42 + 5.5, -253),
            rotation: 3.2,
          }
        ]
      );
    } else {
      noiseMaker.seed(3);
      const sampleHeightMap3 = noiseMaker.noiseLandscape(256, 1 / 128, 3, NoiseType.Perlin, 180);
      // @ts-ignore
      // const sampleHeightMap3 = new Array(256 * 256).fill(0)//.map(item => 0);
      this.currentLevel = new Level(
        sampleHeightMap3,
        createSkybox(drawSkyPurple),
        -8,
        106,
        9,
        materials.underworldGround,
        materials.underworldPath,
        false,
        materials.underworldGrassMaterial,
        materials.underworldRocks,
        materials.underworldWater,
        materials.underworldBark,
        new EnhancedDOMPoint(22, 35, 891),
        new EnhancedDOMPoint(-411, 17, 215),
        new EnhancedDOMPoint(471, 7, -687),
        new EnhancedDOMPoint(-556, 26, -760),
        // -130.80326185103107, 31.988282043103016, -67.86333913563085 - -0.73536226864383
        // -485.98986525035406, -6.351797407448845, 404.71459643568846 - -12.406139571300404
        [
          {
            position: new EnhancedDOMPoint(-130, 31 + 5.5, -67),
            rotation: -0.7
          },
          {
            position: new EnhancedDOMPoint(-480, -6 + 5.5, 400),
            rotation: -0.3
          },
          {
            position: new EnhancedDOMPoint(138, 1 + 5.5, 501),
            rotation: 4
          }
        ]
      );
    }

    this.player.chassisCenter.set(0, 10, 60);
    this.player.isCarryingSpirit = false;
    if (levelNumber === 1) {
      this.currentLevel.spiritPositions = this.currentLevel.spiritPositions.filter((spirit, index) => index % 2 === 0);
    }
    this.spirits = this.currentLevel.spiritPositions.map(position => new Spirit(position));
    console.log(this.currentLevel.spiritPositions.length);

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

    const dropOffGeo = new MoldableCubeGeometry(1, 5, 1, 4, 1, 4).cylindrify(40).done();
    this.dropoffs = this.currentLevel.dropOffs.map((dropOff, index) => {
      const dropOffMesh = new Mesh(dropOffGeo, new Material({ texture: materials.dropOff.texture, emissive: Spirit.Colors[index], isTransparent: true }));
      dropOffMesh.position.set(dropOff);
      return dropOffMesh
    })

    this.scene.add(this.player.mesh, ...this.spirits, ...this.dropoffs);
    this.scene.add(...this.currentLevel.meshesToRender, this.dynamicBody);

    this.scene.skybox = this.currentLevel.skybox;
    this.scene.skybox.bindGeometry();


    this.spiritsTransported = 0;
    hud.reset();
    this.isLoaded = true;
    draw2dEngine.clear();
    this.player.engineGain.gain.value = 0.4;
    drivingThroughWaterAudio.start();
  }

  onLeave() {
    draw2dEngine.clear();
    this.player.engineGain.gain.value = 0;
    drivingThroughWaterAudio.stop();
    this.spirits.forEach(spirit => spirit.audioPlayer?.stop());
  }

  private spiritPlayerDistance = new EnhancedDOMPoint();
  private dropOffPlayerDistance = new EnhancedDOMPoint();
  private spiritDropOffDistance = new EnhancedDOMPoint();

  handleDropOffPickUp() {

    // Drop Off
    if (this.player.isCarryingSpirit) {
      if (this.player.velocity.magnitude < 0.2) {
        const dropOffPosition = this.currentLevel.dropOffs[this.player.carriedSpirit!.dropOffPoint];
        this.dropOffPlayerDistance.subtractVectors(dropOffPosition, this.player.chassisCenter);
        if (Math.abs(this.dropOffPlayerDistance.x) <= 40 && Math.abs(this.dropOffPlayerDistance.z) <= 40) {
          this.dropoffs[this.player.carriedSpirit!.dropOffPoint].scale.y = 1;
          ghostFlyAwayAudio().start();

          this.dynamicBody.position.set(-10000, -10000, -10000);
          this.player.mesh.wrapper.remove(this.dynamicBody);
          this.scene.remove(this.arrowGuideWrapper);
          this.scene.remove(this.arrowGuide)
          this.player.isCarryingSpirit = false;

          this.spiritsTransported++;
        }
      }
    }
    else {
      // Pick Up
      if (this.player.velocity.magnitude < 0.2) {
        this.spirits.some((spirit, index) => {
          this.spiritPlayerDistance.subtractVectors(spirit.position, this.player.chassisCenter)
          if (Math.abs(this.spiritPlayerDistance.x) < 15 && Math.abs(this.spiritPlayerDistance.z) < 15) {
            this.arrowGuide.material.color = spirit.color.map(val => val * 1.5);
            this.dropoffs[spirit.dropOffPoint].scale.y = 300;

            // Find distance from spirit pickup point to it's drop off point and add a relative amount of time
            this.spiritDropOffDistance.subtractVectors(this.currentLevel.dropOffs[spirit.dropOffPoint], spirit.position);
            this.spiritDropOffDistance.y = 0;
            const bonus = this.spiritDropOffDistance.magnitude * this.timePerDistanceUnit;
            hud.setTimeBonus(bonus);
            hud.score += Math.round(bonus);

            ghostThankYouAudio().start();

            this.dynamicBody.position.set(0, 3, -3);
            this.dynamicBody.setRotation(0, Math.PI, 0);
            this.player.mesh.wrapper.add(this.dynamicBody);
            this.player.isCarryingSpirit = true;
            this.player.carriedSpirit = spirit;
            spirit.audioPlayer?.stop();
            this.scene.add(this.arrowGuideWrapper);
            this.scene.remove(spirit.spiritMesh);
            this.scene.remove(spirit.iconMesh);
            this.spirits.splice(index, 1);
            return true;
          }
        });
      }
    }
  }

  arrowLookAtDropOff = new EnhancedDOMPoint();
  onUpdate(): void {
    if (!this.isLoaded) {
      return;
    }

    hud.draw();

    this.player.update(this.gridFaces, this.currentLevel.waterLevel);
    this.handleDropOffPickUp();
    // particle.lookAt(this.player.camera.position);
    // particle2.lookAt(this.player.camera.position);
    // particle.rotate(-1, 0, 0);
    // particle2.rotate(-1, 0, 0);

    if (this.player.isCarryingSpirit) {
      this.arrowGuideWrapper.position.set(this.player.chassisCenter);
      this.arrowGuideWrapper.position.y += 14;
      this.arrowLookAtDropOff = this.currentLevel.dropOffs[this.player.carriedSpirit!.dropOffPoint];
      this.arrowLookAtDropOff.y = this.arrowGuideWrapper.position.y - 10;
      this.arrowGuideWrapper.lookAt(this.arrowLookAtDropOff);
    }

    this.dropoffs.forEach(dropoff => dropoff.rotate(0, 0.01, 0));


    this.scene.updateWorldMatrix();


    renderer.render(this.player.camera, this.scene);

    if (hud.timeRemaining <= 0) {
      getGameStateMachine().setState(gameStates.levelOverState, this.spiritsTransported, hud.score, this.levelNumber);
    }
  }
}
