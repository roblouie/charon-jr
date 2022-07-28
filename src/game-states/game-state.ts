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
import { getGroupedFaces } from '@/engine/physics/parse-faces';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu-state';
import { Object3d } from '@/engine/renderer/object-3d';

class GameState implements State {
  player: ThirdPersonPlayer;
  scene: Scene;
  groupedFaces?: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]};

  constructor() {
    const camera = new Camera(Math.PI / 5, 16 / 9, 1, 400);
    camera.position = new EnhancedDOMPoint(0, 5, -17);
    this.player = new ThirdPersonPlayer(camera);
    this.scene = new Scene();

    const sampleHeightMap = [];
    const imageData = drawLandscape().data;
    for (let i = 0; i < imageData.length; i+= 4) {
      sampleHeightMap.push(imageData[i] / 10 - 10);
    }

    const floor = new Mesh(
      new PlaneGeometry(200, 200, 127, 127, sampleHeightMap),
      materials.grass
    );

    const lake = new Mesh(
      new PlaneGeometry(200, 200, 1, 1),
      materials.lake
    );
    lake.position.y = -5.4 //-7.9;

    const rampGeometry = new MoldableCubeGeometry(3, 13, 13);
    rampGeometry
      .selectVertices(1, 4, 8, 9, 20, 21)
      .translate(0, -8)
      .selectVertices(1)
      .delete()
      .computeNormalsPerPlane()
      .done();

    const ramp = new Mesh(rampGeometry, materials.marble);

    // const testShapeGeometry = new MoldableCube(5, 2, 2, 4);
    //
    // testShapeGeometry.selectVertices(0, 1, 2, 3, 12, 17, 22, 27, 32, 37, 38, 43)
    //   .scale(1, 0.75)
    //   .rotate(0, 0, 0.5)
    //   .updateVerticesAttribute();

    function makeTree() {
      const trunkGeo = new MoldableCubeGeometry(1, 4, 1, 3, 3, 3)
        .cylindrify(0.5)
        .computeNormalsCrossPlane()
        .done();

      const trunk = new Mesh(trunkGeo, materials.wood);

      const foliageGeometry = new MoldableCubeGeometry(4, 4, 4, 2, 2, 2);
      foliageGeometry
        .spherify(4)
        .scale(1, 1.4, 1)
        .noisify(13, 0.05)
        .computeNormalsCrossPlane()
        .done()

      const leaves = new Mesh(foliageGeometry, materials.treeLeaves);
      leaves.position.y += 6;
      return new Object3d(trunk, leaves);
    }

   const tree = makeTree();
    tree.position.x += 10;
    tree.position.y --;
    tree.updateWorldMatrix();
    //

    function makeBridge() {
      const supportArchGeo = new MoldableCubeGeometry(16, 1, 2, 10, 1, 1);
      let start = 0; let end = 3;
      // doTimes(10, index => {
      //   supportArchGeo.selectVertices(...range(start, end))
      //     .rotate(0, 0, 0.3)
      //     .done();
      //   start +=
      // })
      const supportArch = new Mesh(supportArchGeo, materials.tiles);
      return supportArch;
    }
    const bridge = makeBridge();
    bridge.position.y += 4;

    const { cubes } = new Staircase(10, 0.3, 3, 1);

    const wall = new Mesh(
      new MoldableCubeGeometry(3, 4, 4),
      materials.bricks,
    );

    wall.position.x = -6;
    wall.updateWorldMatrix();

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

    const levelParts = [ramp, ...cubes, wall, floor, lake, tree, bridge];

    this.groupedFaces = getGroupedFaces([ramp, ...cubes, wall, floor, lake]);
    levelParts.push(particle);
    levelParts.push(particle2);

    this.scene.add(this.player.mesh);
    this.scene.add(...levelParts);
  }
  onEnter() {
    this.player.mesh.position.y = 1.5;

    const soundPlayer = getAudioPlayer();

    this.scene.skybox = new Skybox(...skyboxes.dayCloud);
    this.scene.skybox.bindGeometry();

    const audio = soundPlayer(...[, , 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17] as const);

    // audio.loop = true;
    audio.connect(panner).connect(audioCtx.destination);
    // audio.start();



// @ts-ignore

  }

  onUpdate(timeElapsed: number): void {
    this.player.update(this.groupedFaces!);

    // particle.lookAt(this.player.camera.position);
    // particle2.lookAt(this.player.camera.position);
    // particle.rotate(-1, 0, 0);
    // particle2.rotate(-1, 0, 0);

    this.scene.updateWorldMatrix();

    renderer.render(this.player.camera, this.scene);

    if (controls.isEscape) {
      getGameStateMachine().setState(menuState);
    }
  }
}

export const gameState = new GameState();
