import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { materials } from '@/texture-maker';
import { Skybox } from '@/skybox';
import { getGroupedFaces } from '@/engine/physics/parse-faces';
import { clamp, doTimes } from '@/engine/helpers';
import { findFloorHeightAtPosition } from '@/engine/physics/surface-collision';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { InstancedMesh } from '@/engine/renderer/instanced-mesh';
import { largeTree, leavesMesh, plant1 } from '@/modeling/flora.modeling';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Texture } from '@/engine/renderer/texture';



export class Level {
  waterLevel: number;
  floorMesh: Mesh;
  meshesToRender: (Mesh | InstancedMesh)[] = [];
  skybox: Skybox;

  constructor(
    heightmap: number[],
    skyboxImages: ImageData[],
    waterLevel: number,
    pathSeed: number,
    groundTexture: Texture,
    pathTexture: Texture,
  ) {

    noiseMaker.seed(pathSeed);
    const result = noiseMaker.noiseLandscape(256, 1 / 128, 2, NoiseType.Lines,8).map(modifyNoiseValue);
    // TODO: This will need modified for new levels to fix the textures to within the ground / path id range
    function modifyNoiseValue(noiseValue: number) {
      return clamp(noiseValue * 4, 0, 1);
    }

    this.floorMesh = new Mesh(
      new PlaneGeometry(2047, 2047, 255, 255, heightmap),
      materials.grass
    );

    this.floorMesh.geometry.setAttribute(AttributeLocation.TextureDepth, new Float32Array(result), 1);

    const lake = new Mesh(
      new PlaneGeometry(2047, 2047, 1, 1),
      materials.lake
    );
    lake.position.y = waterLevel;
    this.waterLevel = waterLevel;
    this.meshesToRender.push(this.floorMesh, lake);
    this.skybox = new Skybox(...skyboxImages);

    function getRandomArbitrary(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const terrain = getGroupedFaces([this.floorMesh]); // TODO: Allow passing in of threshold for walls. This will help with tree placement as anything too steep can be discarded.
    const count = 20;
    const transforms: DOMMatrix[] = [];
    doTimes(count, () => {
      const translateX = getRandomArbitrary(-1023, 1023);
      const translateZ = getRandomArbitrary(-1023, 1023);
      const translateY = findFloorHeightAtPosition(terrain.floorFaces, new EnhancedDOMPoint(translateX, 500, translateZ))!.height;

      const transformMatrix = new DOMMatrix().translate(translateX, translateY, translateZ).rotate(0, getRandomArbitrary(-90, 90), 0);
      // Using the transform matrix as the normal matrix is of course not strictly correct, but it largely works as long as the
      // transform matrix doesn't heavily squash the mesh and this avoids having to write a matrix transpose method just for
      // instanced drawing.
      transforms.push(transformMatrix);
    });
    const plants = new InstancedMesh(plant1.geometry, transforms, count, plant1.material);

    const count2 = 10;
    const transforms2: DOMMatrix[] = [];
    doTimes(count2, () => {
      const translateX = getRandomArbitrary(-1023, 1023);
      const translateZ = getRandomArbitrary(-1023, 1023);
      const translateY = findFloorHeightAtPosition(terrain.floorFaces, new EnhancedDOMPoint(translateX, 500, translateZ))!.height;

      const transformMatrix = new DOMMatrix().translate(translateX, translateY, translateZ).rotate(0, getRandomArbitrary(-90, 90), 0);
      // Using the transform matrix as the normal matrix is of course not strictly correct, but it largely works as long as the
      // transform matrix doesn't heavily squash the mesh and this avoids having to write a matrix transpose method just for
      // instanced drawing.
      transforms2.push(transformMatrix);
    });
    const trees = new InstancedMesh(largeTree.geometry, transforms2, count2, largeTree.material);
    const treeLeaves = new InstancedMesh(leavesMesh.geometry, transforms2, count2, leavesMesh.material);
    // End Instanced drawing test add.

    this.meshesToRender.push(plants, trees, treeLeaves);
  }
}
