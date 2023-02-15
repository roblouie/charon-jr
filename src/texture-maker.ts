import { textureLoader } from '@/engine/renderer/texture-loader';
import { Material } from '@/engine/renderer/material';
import { toImage } from '@/engine/svg-maker/converters';
import { noiseImageReplacement } from '@/engine/new-new-noise';
import { NewNoiseType } from '@/engine/svg-maker/filters';
import { rect, svg, text } from '@/engine/svg-maker/base';

// *********************
// Dirt Path
// *********************
export async function drawDirtPath() {
  return toImage(noiseImageReplacement(128, 33, 1 / 16, 4, NewNoiseType.Fractal, '#525200', '#804b10', 1));
}

// *********************
// Grass
// *********************
async function drawGrass() {
  const earthGrassBuilder = noiseImageReplacement(128, 12, 1 / 32, 3, NewNoiseType.Fractal, '#007002', '#009303', 1);
  const earthGrass = await toImage(earthGrassBuilder);

  const purgatoryPlantsBuilder = noiseImageReplacement(128, 12, 1 / 32, 3, NewNoiseType.Fractal, '#45835a', '#66b47f', 1);
  const purgatoryPlants = await toImage(purgatoryPlantsBuilder);

  return { earthGrass, purgatoryPlants };
}

// *********************
// Water
// *********************
export async function drawWater() {
  const waterBuilder = noiseImageReplacement(128, 12, 1 / 64, 1, NewNoiseType.Turbulence, '#030eaf', '#3264ff', 1);
  const water = await toImage(waterBuilder);

  const lakeTexture = textureLoader.load_(water);
  lakeTexture.textureRepeat.set(6, 6);

  return new Material({texture: lakeTexture, isTransparent: true, color: '#fffc'});
}

// *********************
// Rocks
// *********************
export async function drawRocks() {
  const earthRocksBuilder = noiseImageReplacement(128, 23, 1 / 64, 2, NewNoiseType.Turbulence, '#929292', '#82826e', 1);
  const earthRocks = await toImage(earthRocksBuilder);

  const underworldRocksBuilder = noiseImageReplacement(128, 23, 1 / 64, 2, NewNoiseType.Turbulence, '#3f4d62', '#82826e', 1);
  const underworldRocks = await toImage(underworldRocksBuilder);

  const tombstoneFront = underworldRocks;

  const purgatoryRocksBuilder = noiseImageReplacement(128, 23, 1 / 64, 2, NewNoiseType.Turbulence, '#833700', '#4d1d00', 1);
  const purgatoryRocks = await toImage(purgatoryRocksBuilder);

  const purgatoryFloorBuilder = noiseImageReplacement(128, 23, 1 / 64, 2, NewNoiseType.Turbulence, '#4d1d00', '#833700', 1);
  const purgatoryFloor = await toImage(purgatoryFloorBuilder);

  return { earthRocks, underworldRocks, purgatoryRocks, purgatoryFloor, tombstoneFront };
}

// *********************
// Tree Barks
// *********************
export async function drawTreeBarks() {
  const earthBark = await toImage(noiseImageReplacement(128, 33, 1 / 64, 2, NewNoiseType.Turbulence, '#933d02', '#4d1d00', 1));
  const purgatoryBark = await toImage(noiseImageReplacement(128, 33, 1 / 64, 2, NewNoiseType.Turbulence, '#320600', '#4d1d00', 1));
  const underworldBark = await toImage(noiseImageReplacement(128, 33, 1 / 64, 2, NewNoiseType.Turbulence, '#9a9a9a', '#4d1d00', 1));

  return { earthBark, underworldBark, purgatoryBark };
}


export const truckColor = '#333';

function truckBase(...moreArgs: string[]) {
  return toImage(svg({width: 128, height: 128 },
    rect({ width: 128, height: 128, fill: '#333' }),
    ...moreArgs,
  ));
}

// *********************
// Truck Cab Top
// *********************
export function drawTruckCabTop() {
  return truckBase(
    rect({ x: 10, y: 55, width: 108, height: 20, fill: 'black' }),
    text({ x: 45, y: 115, style: 'font-size: 35px' }, '💀')
  );
}

// *********************
// Truck Cab Front
// *********************
export function drawTruckCabFront() {
  return truckBase(
    text({x: 0, y: 100, style: 'font-size: 35px'}, '⚪'),
    text({x: 80, y: 100, style: 'font-size: 35px'}, '⚪'),
  );
}

// *********************
// Truck Cab Side
// *********************
export function drawTruckCabSide(isRight: boolean) {
  return truckBase(
    text({x: isRight ? 0 : 65, y: 70, style: 'font-size: 45px'}, '🦴'),
  );
}

// *********************
// Underworld Path
// *********************
export function drawUnderworldPath() {
  return toImage(noiseImageReplacement(128, 8, 0.03, 1, NewNoiseType.Turbulence, '#009b1a', '#0e3454', 3));
}


function drawUnderworldGround() {
  return toImage(noiseImageReplacement(128, 8, 0.03, 1, NewNoiseType.Turbulence, '#000522', '#0e3454', 3));
}

export async function newDrawSky(fromColor: string, toColor: string, seed: number, frequency: number | [number, number], octals: number, colorScale = 1) {
  const sidesOfSkybox = [];
  const image = await toImage(noiseImageReplacement(256, seed, frequency, octals, NewNoiseType.Fractal, fromColor, toColor, colorScale));
  for (let i = 0; i < 6; i++) {
    sidesOfSkybox.push(image);
  }

  return sidesOfSkybox;
}


// *********************
// Drop Off Point
// *********************
function drawDropoff() {
  return toImage(noiseImageReplacement(128, 100, 1 / 32, 2, NewNoiseType.Fractal, '#0000', '#fff', 1));
}


// *********************
// Underworld Water
// *********************
function drawUnderworldWater() {
  return toImage(noiseImageReplacement(128, 10, 1/64, 1, NewNoiseType.Turbulence, '#90ca6c', '#2d9f52', 1));
}

export const materials: {[key: string]: Material} = {};
export const skyboxes: {[key: string]: TexImageSource[]} = {};

export async function populateSkyboxes() {
  skyboxes.earthSky = await newDrawSky('#fff', '#00f',9, 0.01, 5, 1.8);
  skyboxes.purgatorySky = await newDrawSky('#c1597e', '#e8671c', 100,1/128, 1, 2);
  skyboxes.underworldSky = await newDrawSky('#180625', '#3c1163', 100, 1/128, 6, 1);
}

export async function populateMaterials() {
  const dirtPath = new Material({texture: textureLoader.load_(await drawDirtPath())})
  dirtPath.texture?.textureRepeat.set(16, 16);
  materials.dirtPath = dirtPath;

  const { earthGrass, purgatoryPlants } = await drawGrass();
  const floorTexture = textureLoader.load_(earthGrass);
  floorTexture.textureRepeat.x = 12; floorTexture.textureRepeat.y = 12;
  materials.grass = new Material({texture: floorTexture});

  materials.purgatoryGrass = new Material({texture: textureLoader.load_(purgatoryPlants) });
  materials.purgatoryGrass.color = [1.0, 0.8, 0.8, 1.0];

  const treeTexture = textureLoader.load_(earthGrass);
  treeTexture.textureRepeat.set(2, 2);
  materials.treeLeaves = new Material({texture: treeTexture });


  materials.lake = await drawWater();

  materials.tire = new Material({ color: '#000'});
  materials.wheel = new Material({ color: '#888'});

  const underworldPathTexture = textureLoader.load_(await drawUnderworldPath());
  underworldPathTexture.textureRepeat.x = 60; underworldPathTexture.textureRepeat.y = 60;
  materials.underworldPath = new Material({texture: underworldPathTexture});

  const underworldGroundTexture = textureLoader.load_(await drawUnderworldGround());
  underworldGroundTexture.textureRepeat.x = 60; underworldGroundTexture.textureRepeat.y = 60;
  materials.underworldGround = new Material({texture: underworldGroundTexture});

  const { earthRocks, underworldRocks, purgatoryRocks, purgatoryFloor, tombstoneFront } = await drawRocks();
  materials.underworldRocks = new Material({texture: textureLoader.load_(underworldRocks)});
  materials.marble = new Material({texture: textureLoader.load_(earthRocks)});
  materials.purgatoryRocks = new Material({texture: textureLoader.load_(purgatoryRocks)});
  materials.purgatoryFloor = new Material({texture: textureLoader.load_(purgatoryFloor)});
  materials.purgatoryFloor.texture?.textureRepeat.set(12, 12);

  materials.tombstoneFront = new Material({texture: textureLoader.load_(tombstoneFront)});

  materials.chassis = new Material({color: truckColor});
  materials.truckCabTop = new Material({texture: textureLoader.load_(await drawTruckCabTop())});
  materials.truckCabFront = new Material({texture: textureLoader.load_(await drawTruckCabFront())});
  materials.truckCabRightSide = new Material({texture: textureLoader.load_(await drawTruckCabSide(true))});
  materials.truckCabLeftSide = new Material({texture: textureLoader.load_(await drawTruckCabSide(false))});
  materials.truckCabRear = new Material({texture: textureLoader.load_(await truckBase())});


  const { underworldBark, earthBark, purgatoryBark } = await drawTreeBarks();
  materials.underworldBark = new Material({texture: textureLoader.load_(underworldBark)});
  materials.purgatoryBark = new Material({texture: textureLoader.load_(purgatoryBark)});
  materials.wood = new Material({texture: textureLoader.load_(earthBark)});

  materials.dropOff = new Material({texture: textureLoader.load_(await drawDropoff())});

  materials.spiritMaterial = new Material({ texture: materials.marble.texture, color: '#fff9', isTransparent: true });
  materials.spiritMaterial.emissive = [1.4, 1.4, 1.4, 1.0];

  const underworldWaterTexture = textureLoader.load_(await drawUnderworldWater());
  underworldWaterTexture.textureRepeat.x = 10; underworldWaterTexture.textureRepeat.y = 10;
  materials.underworldWater = new Material({texture: underworldWaterTexture, isTransparent: true, color: '#fffc'});

  materials.underworldGrassMaterial = new Material({isTransparent: true, color: '#00D9FFBA'});

  textureLoader.bindTextures();
}
