import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { materials } from '@/texture-maker';
import { Skybox } from '@/skybox';
import { getGroupedFaces } from '@/engine/physics/parse-faces';
import { clamp, doTimes } from '@/engine/helpers';
import { findFloorHeightAtPosition } from '@/engine/physics/surface-collision';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { InstancedMesh } from '@/engine/renderer/instanced-mesh';
import { largeTree, leavesMesh, plant1, smallLeaves, smallTree } from '@/modeling/flora.modeling';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Texture } from '@/engine/renderer/texture';
import { largeRock, smallRock } from '@/modeling/rocks.modeling';

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

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

    // Draw Paths
    noiseMaker.seed(pathSeed);
    const path = noiseMaker.noiseLandscape(256, 1 / 128, 2, NoiseType.Lines,8).map(modifyNoiseValue);
    // TODO: This will need modified for new levels to fix the textures to within the ground / path id range
    function modifyNoiseValue(noiseValue: number) {
      return clamp(noiseValue * 4, 0, 1);
    }
    this.floorMesh = new Mesh(
      new PlaneGeometry(2047, 2047, 255, 255, heightmap),
      materials.grass
    );
    this.floorMesh.geometry.setAttribute(AttributeLocation.TextureDepth, new Float32Array(path), 1);

    // Draw water
    const lake = new Mesh(
      new PlaneGeometry(2047, 2047, 1, 1),
      materials.lake
    );
    lake.position.y = waterLevel;
    this.waterLevel = waterLevel;
    this.meshesToRender.push(this.floorMesh, lake);

    // Draw Sky
    this.skybox = new Skybox(...skyboxImages);

    // Draw Grass
    const grassPositionsTest: number[] = [];
    const treePositions: number[] = [];
    const rockPosition: number[] = [];

    // const { floorFaces } = getGroupedFaces([this.floorMesh], 0.8); // TODO: Allow passing in of threshold for walls. This will help with tree placement as anything too steep can be discarded.
    noiseMaker.seed(26);
    const landscapeItemPositionNoise = noiseMaker.noiseLandscape(256, 1 / 16, 4, NoiseType.Perlin,3);
    console.log(Math.max(...landscapeItemPositionNoise))
    const grassTransforms: DOMMatrix[] = [];
    const treeTransforms: DOMMatrix[] = [];
    const rockTransforms: DOMMatrix[] = [];

    const placedTreePositions: EnhancedDOMPoint[] = [];

    doTimes(256 * 256, index => {
      const currentNoiseValue = landscapeItemPositionNoise[index];
      if (currentNoiseValue < 1) {
        return;
      }

      const yPosition = heightmap[index];

      // No landscape plants underwater
      if (yPosition <= waterLevel + 5) {
        return;
      }

      // No landscape on the trail
      if (path[index] <= 0.6) {
        return;
      }

      if (currentNoiseValue >= 2.0) {
        rockTransforms.push(
          new DOMMatrix()
            // @ts-ignore
            .translate(this.floorMesh.geometry.vertices[index].x + getRandomArbitrary(-2, 2), yPosition, this.floorMesh.geometry.vertices[index].z + getRandomArbitrary(-2, 2))
            .scale(getRandomArbitrary(1, 2), getRandomArbitrary(1, 2), getRandomArbitrary(1, 2))
            .rotate(0, getRandomArbitrary(0, 360), 0)
        );
        rockPosition.push(index);
      } else if (currentNoiseValue >= 1 && currentNoiseValue < 1.4) {
        grassPositionsTest.push(index);
        grassTransforms.push(
          new DOMMatrix()
            // @ts-ignore
            .translate(this.floorMesh.geometry.vertices[index].x + getRandomArbitrary(-2, 2), yPosition, this.floorMesh.geometry.vertices[index].z + getRandomArbitrary(-2, 2))
            .scale(getRandomArbitrary(0.7, 1.5), getRandomArbitrary(0.7, 1.5), getRandomArbitrary(0.7, 1.5))
            .rotate(0, getRandomArbitrary(0, 360), 0)
        );
      } else {
        // @ts-ignore
        const treePosition = this.floorMesh.geometry.vertices[index] as EnhancedDOMPoint;

        const hasAClosePosition = placedTreePositions.find(placedPosition => {
          const distance = new EnhancedDOMPoint().subtractVectors(treePosition, placedPosition);
          return distance.magnitude < 16;
        });

        if (!hasAClosePosition) {
          placedTreePositions.push(treePosition)
            treeTransforms.push(
              new DOMMatrix()
                // @ts-ignore
                .translate(treePosition.x + getRandomArbitrary(-2, 2), yPosition, treePosition.z + getRandomArbitrary(-2, 2))
                .scale(getRandomArbitrary(1, 2), getRandomArbitrary(1, 2), getRandomArbitrary(1, 2))
                .rotate(0, getRandomArbitrary(0, 360), 0)
            );


          treePositions.push(index);
        }
      }
    });

    console.log(grassPositionsTest);
    console.log(treePositions);
    console.log(rockPosition);

    // const count = 20;
    // const transforms: DOMMatrix[] = [];
    // doTimes(count, () => {
    //   const translateX = getRandomArbitrary(-1023, 1023);
    //   const translateZ = getRandomArbitrary(-1023, 1023);
    //   const translateY = findFloorHeightAtPosition(terrain.floorFaces, new EnhancedDOMPoint(translateX, 500, translateZ))!.height;
    //
    //   const transformMatrix = new DOMMatrix().translate(translateX, translateY, translateZ).rotate(0, getRandomArbitrary(-90, 90), 0);
    //   // Using the transform matrix as the normal matrix is of course not strictly correct, but it largely works as long as the
    //   // transform matrix doesn't heavily squash the mesh and this avoids having to write a matrix transpose method just for
    //   // instanced drawing.
    //   transforms.push(transformMatrix);
    // });
    const plants = new InstancedMesh(plant1.geometry, grassTransforms, grassTransforms.length, plant1.material);

    // const count2 = 10;
    // const transforms2: DOMMatrix[] = [];
    // doTimes(count2, () => {
    //   const translateX = getRandomArbitrary(-1023, 1023);
    //   const translateZ = getRandomArbitrary(-1023, 1023);
    //   const translateY = findFloorHeightAtPosition(terrain.floorFaces, new EnhancedDOMPoint(translateX, 500, translateZ))!.height;
    //
    //   const transformMatrix = new DOMMatrix().translate(translateX, translateY, translateZ).rotate(0, getRandomArbitrary(-90, 90), 0);
    //   // Using the transform matrix as the normal matrix is of course not strictly correct, but it largely works as long as the
    //   // transform matrix doesn't heavily squash the mesh and this avoids having to write a matrix transpose method just for
    //   // instanced drawing.
    //   transforms2.push(transformMatrix);
    // });
    const trees = new InstancedMesh(largeTree.geometry, treeTransforms, treeTransforms.length, largeTree.material);
    const treeLeaves = new InstancedMesh(leavesMesh.geometry, treeTransforms, treeTransforms.length, leavesMesh.material);

    const rocks = new InstancedMesh(largeRock.geometry, rockTransforms, rockTransforms.length, largeRock.material);
    // End Instanced drawing test add.

    this.meshesToRender.push(plants, trees, treeLeaves, rocks);
  }
}
