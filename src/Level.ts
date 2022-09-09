import { Mesh } from '@/engine/renderer/mesh';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { materials } from '@/texture-maker';
import { Skybox } from '@/skybox';
import { getGroupedFaces, meshToFaces } from '@/engine/physics/parse-faces';
import { clamp, doTimes } from '@/engine/helpers';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { InstancedMesh } from '@/engine/renderer/instanced-mesh';
import { makeLargeTreeGeo, makePlantGeo, makeTreeLeavesGeo } from '@/modeling/flora.modeling';
import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Face } from '@/engine/physics/face';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Material } from '@/engine/renderer/material';
import { makeRock, makeTombstoneGeo } from '@/modeling/stone.modeling';

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

  dropOffs: EnhancedDOMPoint[]

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
    rockMaterial: Material,
    waterMaterial: Material,
    treeMaterial: Material,
    redDropOff: EnhancedDOMPoint,
    greenDropOff: EnhancedDOMPoint,
    blueDropOff: EnhancedDOMPoint
  ) {
    doTimes(256, y => {
      doTimes(256, x => {
        if (y === 0 || y === 255 || x === 0 || x === 255) {
          const index = y * 256 + x;
          heightmap[index] = Math.min(heightmap[index] + 40, 50);
        }
      })
    })

    this.dropOffs = [];
    this.dropOffs.push(redDropOff);
    this.dropOffs.push(greenDropOff);
    this.dropOffs.push(blueDropOff);

    const treeCollision = new MoldableCubeGeometry(3, 12, 3, 2, 1, 2).cylindrify(2).translate(0, 3).done();
    const treeCollisionMesh = new Mesh(treeCollision, new Material({color: '#0000'}));
    this.facesToCollideWith = { floorFaces: [], wallFaces: [], ceilingFaces: [] };

    this.floorMesh = new Mesh(
      new PlaneGeometry(2047, 2047, 255, 255, heightmap.map(val => Math.max(val, waterLevel - 2))),
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

    // tombstone.position.x += 20;
    // tombstone.position.y += 5.9;
    // tombstone.position.z += 50;
    // tombstone.setRotation(-1.1, 0, 0);
    /// 252.40696083320768, -5.865107993918577, 117.6359214012997 - 1.6003420112819629
    //685.3157106012746, -6.1334833313382555, -60.42719705234351 - 2.596863689510206
    // 147.79202938275571, -2.7878840236285156, -371.0654075845064 - 5.619473704785751
    // Place Ramps
    const purgatoryRampPositions = [
      {
        position: new EnhancedDOMPoint(252, -5.8 + 5.5, 117),
        rotation: 1.6,
      },
      {
        position: new EnhancedDOMPoint(685, -6 + 5.5, -60),
        rotation: 2.59,
      },
      {
        position: new EnhancedDOMPoint(148, -2.7 + 5.5, -371),
        rotation: 5.6,
      }
    ]

    purgatoryRampPositions.forEach(rampData => {
      this.placeRamps(rampData.position, rampData.rotation);
    });

    // Draw Scenery
    noiseMaker.seed(scenerySeed);
    const landscapeItemPositionNoise = noiseMaker.noiseLandscape(256, 1 / 16, 4, NoiseType.Perlin,3);
    const grassTransforms: DOMMatrix[] = [];
    const treeTransforms: DOMMatrix[] = [];
    const rockTransforms: DOMMatrix[] = [];

    const placedTreePositions: EnhancedDOMPoint[] = [];

    const rock = new Mesh(makeRock(), materials.tire);

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
        const rockFaces = meshToFaces([rock], rockGeoTransform);
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
        const hasAClosePosition = this.spiritPositions.find(placedPosition => {
          const distance = new EnhancedDOMPoint().subtractVectors(spiritPosition, placedPosition);
          return distance.magnitude < 50;
        });

        if (!hasAClosePosition) {
          this.spiritPositions.push(spiritPosition);
        }
        // spiritTransforms.push(new DOMMatrix().translateSelf(spiritPosition.x, spiritPosition.y, spiritPosition.z))
      }

      // With rocks and spirits drawn, filter out all other values less than 1 before continuing.
      // This is so spirits and rocks don't appear in the middle of a "forested" area, so this is like a separator.
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

    const plants = new InstancedMesh(makePlantGeo(), grassTransforms, grassTransforms.length, plantMaterial);
    const trees = new InstancedMesh(makeLargeTreeGeo(), treeTransforms, treeTransforms.length, treeMaterial);
    if (isTreeLeavesShowing) {
      const treeLeaves = new InstancedMesh(makeTreeLeavesGeo(), treeTransforms, treeTransforms.length, materials.treeLeaves);
      this.meshesToRender.push(treeLeaves);
    }
    const rocks = new InstancedMesh(makeRock(), rockTransforms, rockTransforms.length, rockMaterial);

    this.facesToCollideWith.floorFaces.sort((faceA, faceB) => faceB.upperY - faceA.upperY);
    this.meshesToRender.push(plants, trees, rocks);
  }

  placeRamps(rampPosition: EnhancedDOMPoint, rampYRotation: number) {
    const rampGeometry = new MoldableCubeGeometry(16, 6, 3);
    const blocker = new Mesh(rampGeometry, materials.marble);
    blocker.position.x += rampPosition.x;
    blocker.position.y += rampPosition.y - 5;
    blocker.position.z += rampPosition.z;
    blocker.rotate(0, rampYRotation, 0);
    blocker.updateWorldMatrix();
    const tombstone = new Mesh(makeTombstoneGeo(16, 30, 4, 14, 8, 1), materials.gameTombstone);
    tombstone.position.set(rampPosition);
    tombstone.rotate(0, rampYRotation, 0);
    tombstone.updateWorldMatrix();
    this.meshesToRender.push(blocker);
    this.meshesToRender.push(tombstone);
    getGroupedFaces(meshToFaces([tombstone, blocker]), this.facesToCollideWith);
  }
}

function getMatrixForPosition(xzPosition: EnhancedDOMPoint, yPosition: number, minScale: number, maxScale: number) {
  return new DOMMatrix()
    .translate(xzPosition.x + getRandomArbitrary(-2, 2), yPosition, xzPosition.z + getRandomArbitrary(-2, 2))
    .scale(getRandomArbitrary(minScale, maxScale), getRandomArbitrary(minScale, maxScale), getRandomArbitrary(minScale, maxScale))
    .rotate(0, getRandomArbitrary(0, 360), 0)
}
