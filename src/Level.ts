import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { materials } from '@/texture-maker';
import { Skybox } from '@/skybox';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';
import { clamp, doTimes } from '@/engine/helpers';
import { findFloorHeightAtPosition } from '@/engine/physics/surface-collision';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { InstancedMesh } from '@/engine/renderer/instanced-mesh';
import { largeTree, leavesMesh, plant1, smallLeaves, smallTree } from '@/modeling/flora.modeling';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Texture } from '@/engine/renderer/texture';
import { largeRock, smallRock } from '@/modeling/rocks.modeling';
import { Face } from '@/engine/physics/face';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Material } from '@/engine/renderer/material';
import { staticBodyGeo } from '@/spirit';

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}



export class Level {
  waterLevel: number;
  floorMesh: Mesh;
  meshesToRender: (Mesh | InstancedMesh)[] = [];
  facesToCollideWith: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]};
  skybox: Skybox;
  spiritPositions: EnhancedDOMPoint[] = [];
  redDropOff: EnhancedDOMPoint;
  greenDropOff: EnhancedDOMPoint;
  blueDropOff: EnhancedDOMPoint;

  constructor(
    heightmap: number[],
    skyboxImages: ImageData[],
    waterLevel: number,
    pathSeed: number | undefined,
    scenerySeed: number,
    groundMaterial: Material,
    pathMaterial: Material | undefined,
    isTreeLeavesShowing: boolean,
    plantMaterial: Material,
    waterMaterial: Material,
    redDropOff: EnhancedDOMPoint,
    greenDropOff: EnhancedDOMPoint,
    blueDropOff: EnhancedDOMPoint
  ) {
    this.redDropOff = redDropOff;
    this.greenDropOff = greenDropOff;
    this.blueDropOff = blueDropOff;

    const treeCollision = new MoldableCubeGeometry(3, 12, 3, 2, 1, 2).cylindrify(2).translate(0, 3).done();
    const treeCollisionMesh = new Mesh(treeCollision, new Material({color: '#0000'}));
    this.facesToCollideWith = { floorFaces: [], wallFaces: [], ceilingFaces: [] };

    this.floorMesh = new Mesh(
      new PlaneGeometry(2047, 2047, 255, 255, heightmap.map(val => Math.max(val, waterLevel - 3))),
      groundMaterial
    );

    let path: number[] = [];
    // Draw Paths
    if (pathSeed) {
      noiseMaker.seed(pathSeed);
      path = noiseMaker.noiseLandscape(256, 1 / 128, 2, NoiseType.Lines,8).map(modifyNoiseValue);
      // TODO: This will need modified for new levels to fix the textures to within the ground / path id range
      function modifyNoiseValue(noiseValue: number) {
        return clamp(noiseValue * 4, 0, 1);
      }

      const pathTextureIds = path.map(val => val + pathMaterial!.texture!.id);
      this.floorMesh.geometry.setAttribute(AttributeLocation.TextureDepth, new Float32Array(pathTextureIds), 1);
    }

    const floorFaces = meshToFaces([this.floorMesh]);
    getGroupedFaces(floorFaces, this.facesToCollideWith);

    // Draw water
    const lake = new Mesh(
      new PlaneGeometry(2047, 2047, 1, 1),
      waterMaterial
    );
    lake.position.y = waterLevel;
    this.waterLevel = waterLevel;
    this.meshesToRender.push(this.floorMesh, lake);

    // Draw Sky
    this.skybox = new Skybox(...skyboxImages);

    // Draw Scenery
    noiseMaker.seed(scenerySeed);
    const landscapeItemPositionNoise = noiseMaker.noiseLandscape(256, 1 / 16, 4, NoiseType.Perlin,3);
    console.log(Math.max(...landscapeItemPositionNoise))
    const grassTransforms: DOMMatrix[] = [];
    const treeTransforms: DOMMatrix[] = [];
    const rockTransforms: DOMMatrix[] = [];

    const placedTreePositions: EnhancedDOMPoint[] = [];

    doTimes(256 * 256, index => {
      const currentNoiseValue = landscapeItemPositionNoise[index];

      const yPosition = heightmap[index];

      // No landscape plants underwater
      if (yPosition <= waterLevel + 5) {
        return;
      }

      // No landscape on the trail
      if (path.length && path[index] <= 0.7) {
        return;
      }

      // Rock Positions
      if (currentNoiseValue < 0 && currentNoiseValue >= -0.005) {
        // @ts-ignore
        const rockGeoTransform = getMatrixForPosition(this.floorMesh.geometry.vertices[index], yPosition, 1, 2);
        const rockFaces = meshToFaces([largeRock], rockGeoTransform);
        getGroupedFaces(rockFaces, this.facesToCollideWith);
        rockTransforms.push(rockGeoTransform);
        return;
      }

      // Spirit Positions
      if (
        (currentNoiseValue < -1.2 && currentNoiseValue > -1.22)
        || (currentNoiseValue < 1.8 && currentNoiseValue > 1.82)
        || (currentNoiseValue < -2.0 && currentNoiseValue > -2.02)
      ) {
        // @ts-ignore
        const spiritPosition = new EnhancedDOMPoint(this.floorMesh.geometry.vertices[index].x, yPosition + 2, this.floorMesh.geometry.vertices[index].z)
        this.spiritPositions.push(spiritPosition);
        // spiritTransforms.push(new DOMMatrix().translateSelf(spiritPosition.x, spiritPosition.y, spiritPosition.z))
      }

      // With rocks and spirits drawn, filter out all other values less than 1 before continuing.
      // This is so spirits and rocks don't appear in the middle of a "forested" area, so this is like a seperator.
      if (currentNoiseValue < 1) {
        return;
      }

      // Place either tree or grass depending on value
      if (currentNoiseValue >= 1 && currentNoiseValue < 1.4) {
        // @ts-ignore
        grassTransforms.push(getMatrixForPosition(this.floorMesh.geometry.vertices[index], yPosition, 0.7, 1.5));
      } else {
        // @ts-ignore
        const treePosition = this.floorMesh.geometry.vertices[index] as EnhancedDOMPoint;

        const hasAClosePosition = placedTreePositions.find(placedPosition => {
          const distance = new EnhancedDOMPoint().subtractVectors(treePosition, placedPosition);
          return distance.magnitude < 16;
        });

        if (!hasAClosePosition) {
          placedTreePositions.push(treePosition);
          const treeTransform = getMatrixForPosition(treePosition, yPosition, 1, 1);
          const treeFaces = meshToFaces([treeCollisionMesh], treeTransform);
          // no floor faces for tree, so you don't get pushed up
          getGroupedFaces(treeFaces.filter(face => face.normal.y <= 0.5), this.facesToCollideWith);
          treeTransforms.push(treeTransform);
        }
      }
    });

    const plants = new InstancedMesh(plant1.geometry, grassTransforms, grassTransforms.length, plantMaterial);
    const trees = new InstancedMesh(largeTree.geometry, treeTransforms, treeTransforms.length, largeTree.material);
    if (isTreeLeavesShowing) {
      const treeLeaves = new InstancedMesh(leavesMesh.geometry, treeTransforms, treeTransforms.length, leavesMesh.material);
      this.meshesToRender.push(treeLeaves);
    }
    const rocks = new InstancedMesh(largeRock.geometry, rockTransforms, rockTransforms.length, largeRock.material);

    console.log(this.spiritPositions.length);
    this.facesToCollideWith.floorFaces.sort((faceA, faceB) => faceB.upperY - faceA.upperY);
    console.log(this.facesToCollideWith.ceilingFaces);
    this.meshesToRender.push(plants, trees, rocks);
  }
}

function getMatrixForPosition(xzPosition: EnhancedDOMPoint, yPosition: number, minScale: number, maxScale: number) {
  return new DOMMatrix()
    .translate(xzPosition.x + getRandomArbitrary(-2, 2), yPosition, xzPosition.z + getRandomArbitrary(-2, 2))
    .scale(getRandomArbitrary(minScale, maxScale), getRandomArbitrary(minScale, maxScale), getRandomArbitrary(minScale, maxScale))
    .rotate(0, getRandomArbitrary(0, 360), 0)
}
