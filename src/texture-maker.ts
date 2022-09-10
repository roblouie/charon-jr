import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { Material } from '@/engine/renderer/material';
import { doTimes } from '@/engine/helpers';
import { getData, storeData } from '@/core/data-storage';

const [drawContext, tileContext, noiseContext] = ['draw', 'tile', 'noise'].map(id => {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.width = id === 'tile' ? 256 : 128;
  canvas.height = id === 'tile' ? 256 : 128;
  return canvas.getContext('2d')!;
});

const resolution = 128;

// *********************
// Dirt Path
// *********************
export function drawDirtPath() {
  clearWith('#525200');
  noiseMaker.seed(33);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 16, 4, NoiseType.Perlin, '#804b10', 128), 0, 0);
  drawContext.globalCompositeOperation = 'screen';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 10);
  return mainImageData();
}

// *********************
// Grass
// *********************
function drawGrass() {
  noiseMaker.seed(12);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 32, 3, NoiseType.Perlin, '#009303', 128), 0, 0);

  clearWith('#007002');
  // drawContext.globalCompositeOperation = 'screen';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 8);
  const earthGrass = mainImageData();

  noiseMaker.seed(12);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 32, 3, NoiseType.Perlin, '#66b47f', 128), 0, 0);

  clearWith('#45835a');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const purgatoryPlants = mainImageData();

  // clearWith('#008a44');
  // drawContext.globalCompositeOperation = 'screen';
  // drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  // const purgatoryPlants = mainImageData();
  return { earthGrass, purgatoryPlants };
}

// *********************
// Water
// *********************
export function drawWater() {
  clearWith('#030eaf');
  noiseMaker.seed(10);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Edge, '#3264ff', 220), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const lakeTexture = textureLoader.load(mainImageData());
  lakeTexture.repeat.x = 6; lakeTexture.repeat.y = 6;

  return new Material({texture: lakeTexture, isTransparent: true, color: '#fffc'});
}

// *********************
// Rocks
// *********************
export function drawRocks() {
  noiseMaker.seed(23);
  const noiseImage = noiseMaker.noiseImage(128, 1 / 64, 2, NoiseType.Edge, '#82826e', 220, true, 'x', 'y', 'z', 0);
  noiseContext.putImageData(noiseImage, 0, 0);

  clearWith('#929292');
  drawContext.globalCompositeOperation = 'color-dodge';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const earthRocks = mainImageData();

  clearWith('#3f4d62');
  drawContext.globalCompositeOperation = 'color-dodge';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 9);
  const underworldRocks = mainImageData();

  drawContext.globalCompositeOperation = 'source-over';
  drawContext.fillStyle = '#333';
  drawContext.scale(1, -1);
  drawContext.textAlign = 'center';
  drawContext.font = '70px Times New Roman';
  drawContext.fillText('RIP', 64, -50);
  const tombstoneFront = mainImageData();

  clearWith('#4d1d00');
  drawContext.globalCompositeOperation = 'color-dodge';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 9);
  const purgatoryRocks = mainImageData();

  clearWith('#833700');
  drawContext.globalCompositeOperation = 'color-dodge';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 12);
  const purgatoryFloor = mainImageData();

  return { earthRocks, underworldRocks, purgatoryRocks, purgatoryFloor, tombstoneFront };
}

// *********************
// Tree Barks
// *********************
export function drawTreeBarks() {
  noiseMaker.seed(33);
  const noiseImage = noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#141414', 200, true, 'x', 'y', 'z', 0)
  noiseContext.putImageData(noiseImage, 0, 0);

  clearWith('#933d02');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const earthBark = mainImageData();

  clearWith('#9a9a9a');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const underworldBark = mainImageData();

  return { earthBark, underworldBark };
}


export const truckColor = '#333';

// *********************
// Truck Cab Top
// *********************
export function drawTruckCabTop() {
  clearWith(truckColor);
  drawContext.fillStyle = 'black';
  drawContext.fillRect(10, 55, 108, 20);
  drawContext.textAlign = 'center';
  drawContext.font = '35px sans-serif';
  drawContext.fillText('💀', 64, 115);
  return mainImageData();
}

// *********************
// Truck Cab Front
// *********************
export function drawTruckCabFront() {
  clearWith(truckColor);
  drawContext.fillStyle = 'black';
  drawContext.textAlign = 'center';
  drawContext.font = '35px sans-serif';
  drawContext.save();
  drawContext.scale(0.6, 1);
  drawContext.fillText('⚪', 32, 105);
  drawContext.fillText('⚪', 180, 105);
  drawContext.restore();

  doTimes(5, index => {
    drawContext.fillRect(42 + index * 10, 10, 5, 60);
  });
  return mainImageData();
}

// *********************
// Truck Cab Side
// *********************
export function drawTruckCabSide(isRight: boolean) {
  clearWith(truckColor);
  drawContext.textAlign = 'center';
  drawContext.font = '45px sans-serif';
  drawContext.save();
  drawContext.scale(0.6, -1);
  drawContext.fillText('🦴', isRight ? 52 : 152, -40);
  drawContext.scale(-1, 1);
  drawContext.fillText('🦴', isRight ? -52 : -152, -40);
  drawContext.restore();
  return mainImageData();
}


// *********************
// Truck Cab Rear
// *********************
export function drawTruckCabRear() {
  clearWith(truckColor);
  return mainImageData();
}


// *********************
// Underworld Path
// *********************
export function drawUnderworldPath() {
  clearWith('#143454');
  noiseMaker.seed(4);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#51926c', 180, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.filter = 'contrast(500%)';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 5);
  return mainImageData();
}


// *********************
// Underworld Ground
// *********************
export function drawUnderworldGround() {
  clearWith('#153456');
  noiseMaker.seed(4);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#090511', 180, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.filter = 'contrast(500%)';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 8);
  return mainImageData();
}



// *********************
// Underworld Sky
// *********************
export function drawSkyPurple(firstDimension: 'x' | 'y' | 'z', secondDimension: 'x' | 'y' | 'z', sliceDimension: 'x' | 'y' | 'z', slice: number, flip = false) {
  clearWith('#180625');
  noiseMaker.seed(100);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 128, 6, NoiseType.Perlin, '#3c1163', 210, true,firstDimension, secondDimension, sliceDimension, slice, flip), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  tileContext.scale(2, secondDimension=== 'z' ? 2 : 1);
  tileDrawn();
  return tileContext.getImageData(0, 0, 256, 256);
}

// *********************
// Earth Sky
// *********************
export function drawEarthSky(firstDimension: 'x' | 'y' | 'z', secondDimension: 'x' | 'y' | 'z', sliceDimension: 'x' | 'y' | 'z', slice: number, flip = false) {
  clearWith('#0256b4');
  noiseMaker.seed(100);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 6, NoiseType.Perlin, '#fff', 210, true, firstDimension, secondDimension, sliceDimension, slice, flip), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  tileDrawn();
  return tileContext.getImageData(0, 0, 256, 256);
}


// *********************
// Underworld Water
// *********************
function drawUnderworldWater() {
  clearWith('#90ca6c'); // '#16e868'
  noiseMaker.seed(10);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Edge, '#2d9f52', 220), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);

  return mainImageData();
}



// *********************
// Purgatory Sky
// *********************
export function drawPurgatorySky(firstDimension: 'x' | 'y' | 'z', secondDimension: 'x' | 'y' | 'z', sliceDimension: 'x' | 'y' | 'z', slice: number, flip = false) {
  clearWith('#e8671c');

  noiseMaker.seed(100);

  const noiseImage = noiseMaker.noiseImage(128, 1 / 128, 1, NoiseType.Perlin, '#c1597e', 180, true, firstDimension, secondDimension, sliceDimension, slice, flip);
  noiseContext.putImageData(noiseImage, 0, 0);
  drawContext.globalCompositeOperation = 'difference';
  noiseContext.putImageData(noiseImage, 0, 0, 0, 0, 256, 256);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  tileDrawn();
  return tileContext.getImageData(0, 0, 256, 256);
}



export const materials: {[key: string]: Material} = {};

export async function populateMaterials() {
  noiseMaker.noiseCache = await getData() ?? {};

  const dirtPath = new Material({texture: textureLoader.load(drawDirtPath())})
  dirtPath.texture?.repeat.set(16, 16);

  const { earthGrass, purgatoryPlants } = drawGrass();
  const floorTexture = textureLoader.load(earthGrass);
  floorTexture.repeat.x = 12; floorTexture.repeat.y = 12;
  materials.grass = new Material({texture: floorTexture});

  materials.purgatoryGrass = new Material({texture: textureLoader.load(purgatoryPlants) });
  materials.purgatoryGrass.color = [1.0, 0.8, 0.8, 1.0]

  const treeTexture = textureLoader.load(earthGrass);
  treeTexture.repeat.set(2, 2);
  const treeLeaves = new Material({texture: treeTexture });


  const lake = drawWater();

  const tire = new Material({ color: '#000'});
  const wheel = new Material({ color: '#888'});

  const underworldPathTexture = textureLoader.load(drawUnderworldPath());
  underworldPathTexture.repeat.x = 60; underworldPathTexture.repeat.y = 60;
  const underworldPath = new Material({texture: underworldPathTexture});

  const underworldGroundTexture = textureLoader.load(drawUnderworldGround());
  underworldGroundTexture.repeat.x = 60; underworldGroundTexture.repeat.y = 60;
  materials.underworldGround = new Material({texture: underworldGroundTexture});

  const { earthRocks, underworldRocks, purgatoryRocks, purgatoryFloor, tombstoneFront } = drawRocks();
  materials.underworldRocks = new Material({texture: textureLoader.load(underworldRocks)});
  materials.marble = new Material({texture: textureLoader.load(earthRocks)})
  materials.purgatoryRocks = new Material({texture: textureLoader.load(purgatoryRocks)});
  materials.purgatoryFloor = new Material({texture: textureLoader.load(purgatoryFloor)});
  materials.purgatoryFloor.texture?.repeat.set(12, 12);

  materials.tombstoneFront = new Material({texture: textureLoader.load(tombstoneFront)});

  materials.chassis = new Material({color: truckColor});
  materials.truckCabTop = new Material({texture: textureLoader.load(drawTruckCabTop())});
  materials.truckCabFront = new Material({texture: textureLoader.load(drawTruckCabFront())});
  materials.truckCabRightSide = new Material({texture: textureLoader.load(drawTruckCabSide(true))});
  materials.truckCabLeftSide = new Material({texture: textureLoader.load(drawTruckCabSide(false))});
  materials.truckCabRear = new Material({texture: textureLoader.load(drawTruckCabRear())});

  materials.spiritMaterial = new Material({ texture: materials.marble.texture, color: '#fff9', emissive: '#fff9', isTransparent: true })

  const { underworldBark, earthBark } = drawTreeBarks();
  materials.underworldBark = new Material({texture: textureLoader.load(underworldBark)});
  materials.wood = new Material({texture: textureLoader.load(earthBark)});

  const underworldWaterTexture = textureLoader.load(drawUnderworldWater());
  underworldWaterTexture.repeat.x = 10; underworldWaterTexture.repeat.y = 10;
  materials.underworldWater = new Material({texture: underworldWaterTexture, isTransparent: true, color: '#fffc'})

  materials.underworldGrassMaterial = new Material({isTransparent: true, color: '#00D9FFBA'})

  materials.lake = lake;
  materials.treeLeaves = treeLeaves;
  materials.tire = tire;
  materials.wheel = wheel;
  materials.dirtPath = dirtPath;
  materials.underworldPath = underworldPath;

  textureLoader.bindTextures();

  storeData(noiseMaker.noiseCache);
}



function mainImageData() {
  return drawContext.getImageData(0, 0, 128, 128);
}

function clearWith(color: string, context = drawContext) {
  drawContext.resetTransform();
  tileContext.resetTransform();
  context.clearRect(0, 0, resolution, resolution);
  context.globalCompositeOperation = 'source-over';
  context.filter = 'none';
  context.fillStyle = color;
  context.fillRect(0, 0, resolution, resolution);
}

function noisify(context: CanvasRenderingContext2D, roughness = 1) {
  const imageData = context.getImageData(0, 0, resolution, resolution);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];

    const adjuster = (Math.random() - 1) * roughness;
    imageData.data[i] = red + (adjuster * red / 256);
    imageData.data[i + 1] = green + (adjuster * green / 256);
    imageData.data[i + 2] = blue + (adjuster * blue / 256);
  }
  context.putImageData(imageData, 0, 0);
}

function tileDrawn() {
  tileContext.drawImage(drawContext.canvas, 0, 0, resolution, resolution);
  tileContext.drawImage(drawContext.canvas, resolution, 0, resolution, resolution);
  tileContext.drawImage(drawContext.canvas, resolution, resolution, resolution, resolution);
  tileContext.drawImage(drawContext.canvas, 0, resolution, resolution, resolution);
}


// Cuts slices off the edges of a 3d texture to create a skybox. An easier to read version of this would be the following:
//
// const skyRight = skyboxDrawCallback('z', 'y', 'x', 0, true);
// const skyLeft = skyboxDrawCallback('z', 'y', 'x', 127);
//
// const skyCeiling = skyboxDrawCallback('x', 'z', 'y', 0);
// const skyFloor = skyboxDrawCallback('x', 'z', 'y', 127);
//
// const skyFront = skyboxDrawCallback('x', 'y', 'z', 0);
// const skyBack = skyboxDrawCallback('x', 'y', 'z', 127, true);
//
// return [skyRight, skyLeft, skyCeiling, skyFloor, skyFront, skyBack];
//
// This is functionally equivalent to the code-golfed version below.
// @ts-ignore
export function createSkybox(callback: (firstDimension: 'x' | 'y' | 'z', secondDimension: 'x' | 'y' | 'z', sliceDimension: 'x' | 'y' | 'z', slice: number, flip: boolean) => ImageData) {
  return ['zyx', 'zyx', 'xzy', 'xzy', 'xyz', 'xyz'].map((coordinates, i) => {
    // @ts-ignore
    return callback(...coordinates.split(''), i % 2 === 0 ? 0 : 127, i === 0 || i === 5);
  });
}
