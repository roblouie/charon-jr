import { noiseMaker, NoiseType } from '@/engine/texture-creation/noise-maker';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { Material } from '@/engine/renderer/material';
import { doTimes } from '@/engine/helpers';
import { getData, storeData } from '@/core/data-storage';
import { draw2dEngine } from '@/core/draw2d-engine';

interface CanvasPatterns {
  [key: string]: CanvasPattern;
}
export const canvasPatterns: CanvasPatterns = {};

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
  drawContext.globalCompositeOperation = 'source-over';
  return mainImageData();
}

// *********************
// Grass
// *********************
function drawGrass() {
  clearWith('#090');
  noiseMaker.seed(12);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 32, 3, NoiseType.Perlin, '#0f0', 128), 0, 0);
  drawContext.globalCompositeOperation = 'screen';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  drawContext.globalCompositeOperation = 'source-over';
  return mainImageData();
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
// Marble
// *********************
export function drawMarble() {
  clearWith('#ccccab');
  drawContext.globalCompositeOperation = 'color-dodge';
  noiseMaker.seed(23);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 2, NoiseType.Edge, '#82826e', 220, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
}

// *********************
// Wood
// *********************
export function drawWood() {
  clearWith('#933d00');
  drawContext.globalCompositeOperation = 'overlay';
  noiseMaker.seed(33);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#141414', 200, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 2);
  return mainImageData();
}

// *********************
// Tiles
// *********************
export function drawTiles() {
  clearWith('#bbb');
  drawContext.fillStyle = '#aaa';
  drawContext.strokeStyle = '#999';
  tile((x, y) => {
    drawContext.filter = 'drop-shadow(1px 1px 2px #9996)';
    drawContext.rect(x + 6, y + 6, 116, 54);
    drawContext.stroke();
    drawContext.fill();
  }, resolution, resolution / 2);
  noisify(drawContext, 3);
  return mainImageData();
}


export const truckColor = '#333';


// *********************
// Chassis
// *********************
function drawChassis() {
  clearWith('#bbb');
  drawContext.fillStyle = '#aaa';
  drawContext.strokeStyle = '#999';
  tile((x, y) => {
    drawContext.filter = 'drop-shadow(1px 1px 2px #9996)';
    drawContext.rect(x + 6, y + 6, 116, 54);
    drawContext.stroke();
    drawContext.fill();
  }, resolution, resolution / 2);
  noisify(drawContext, 3);
  return mainImageData();
}

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
export function drawVolcanicRock() {
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
  clearWith('#143454');
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
  clearWith('#3c1163');
  noiseMaker.seed(100);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 128, 6, NoiseType.Perlin, '#561791', 70, false, firstDimension, secondDimension, sliceDimension, slice, flip), 0, 0);
  drawContext.globalCompositeOperation = 'color-burn';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  tileDrawn();
  return tileContext.getImageData(0, 0, 256, 256);
}


// *********************
// Underworld Rocks
// *********************
export function drawUnderworldRocks() {
  clearWith('#384658');
  drawContext.globalCompositeOperation = 'color-dodge';
  noiseMaker.seed(23);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 3, NoiseType.Edge, '#82826e', 220, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  draw2dEngine.marbleFill = draw2dEngine.context.createPattern(drawContext.canvas, 'repeat')!;
  return mainImageData();
}

// *********************
// Underworld Water
// *********************
function drawUnderworldWater() {
  clearWith('#3bca6c'); // '#16e868'
  noiseMaker.seed(10);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Edge, '#2d9f52', 220), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);

  return mainImageData();
}



export const materials: {[key: string]: Material} = {};

export async function populateMaterials() {
  noiseMaker.noiseCache = await getData() ?? {};

  const dirtPath = new Material({texture: textureLoader.load(drawDirtPath())})
  dirtPath.texture?.repeat.set(16, 16);

  const floorTexture = textureLoader.load(drawGrass());
  floorTexture.repeat.x = 12; floorTexture.repeat.y = 12;
  materials.grass = new Material({texture: floorTexture});

  const treeTexture = textureLoader.load(drawGrass());
  treeTexture.repeat.set(2, 2);
  const treeLeaves = new Material({texture: treeTexture });
  const pergatoryGrass = new Material({texture: treeTexture, color: '#f4f' });



  const tiles = new Material({texture: textureLoader.load(drawTiles())});

  const lake = drawWater();

  const tire = new Material({ color: '#000'});
  const wheel = new Material({ color: '#888'});

  const underworldPathTexture = textureLoader.load(drawVolcanicRock());
  underworldPathTexture.repeat.x = 60; underworldPathTexture.repeat.y = 60;
  const underworldPath = new Material({texture: underworldPathTexture});

  const underworldGroundTexture = textureLoader.load(drawUnderworldGround());
  underworldGroundTexture.repeat.x = 60; underworldGroundTexture.repeat.y = 60;
  materials.underworldGround = new Material({texture: underworldGroundTexture});

  materials.underworldRocks = new Material({texture: textureLoader.load(drawUnderworldRocks())});

  materials.chassis = new Material({color: truckColor});
  materials.truckCabTop = new Material({texture: textureLoader.load(drawTruckCabTop())});
  materials.truckCabFront = new Material({texture: textureLoader.load(drawTruckCabFront())});
  materials.truckCabRightSide = new Material({texture: textureLoader.load(drawTruckCabSide(true))});
  materials.truckCabLeftSide = new Material({texture: textureLoader.load(drawTruckCabSide(false))});
  materials.truckCabRear = new Material({texture: textureLoader.load(drawTruckCabRear())});

  materials.marble = new Material({texture: textureLoader.load(drawMarble())})
  materials.spiritMaterial = new Material({ texture: materials.marble.texture, color: '#fff9', emissive: '#fff9', isTransparent: true })

  const woodTexture = textureLoader.load(drawWood())
  materials.underworldBark = new Material({texture: woodTexture, color: '#2cf'});
  materials.wood = new Material({texture: woodTexture});

  const underworldWaterTexture = textureLoader.load(drawUnderworldWater());
  underworldWaterTexture.repeat.x = 10; underworldWaterTexture.repeat.y = 10;
  materials.underworldWater = new Material({texture: underworldWaterTexture, isTransparent: true, color: '#fffc'})

  materials.underworldGrassMaterial = new Material({isTransparent: true, color: '#00D9FFBA'})

  materials.lake = lake;
  materials.treeLeaves = treeLeaves;
  materials.tiles = tiles;
  materials.tire = tire;
  materials.wheel = wheel;
  materials.dirtPath = dirtPath;
  materials.pergatoryGrass = pergatoryGrass;
  materials.underworldPath = underworldPath;

  textureLoader.bindTextures();

  storeData(noiseMaker.noiseCache);
}

export function drawEarthSky(firstDimension: 'x' | 'y' | 'z', secondDimension: 'x' | 'y' | 'z', sliceDimension: 'x' | 'y' | 'z', slice: number, flip = false) {
  clearWith('#2d75fa');
  noiseMaker.seed(100);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 6, NoiseType.Perlin, '#fff', 210, true, firstDimension, secondDimension, sliceDimension, slice, flip), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  tileDrawn();
  return tileContext.getImageData(0, 0, 256, 256);
}

export function drawPurgatorySky(firstDimension: 'x' | 'y' | 'z', secondDimension: 'x' | 'y' | 'z', sliceDimension: 'x' | 'y' | 'z', slice: number, flip = false) {
  clearWith('#f53c00');

  noiseMaker.seed(100);

  const noiseImage = noiseMaker.noiseImage(128, 1 / 64, 2, NoiseType.Perlin, '#6e16ff', 180, true, firstDimension, secondDimension, sliceDimension, slice, flip);
  noiseContext.putImageData(noiseImage, 0, 0);
  drawContext.globalCompositeOperation = 'difference';

  noiseContext.putImageData(noiseImage, 0, 0, 0, 0, 256, 256);

  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  tileContext.save();
  tileContext.scale(4, 1);
  tileDrawn();
  tileContext.restore();
  return tileContext.getImageData(0, 0, 256, 256);
}

function mainImageData() {
  return drawContext.getImageData(0, 0, 128, 128);
}

function clearWith(color: string, context = drawContext) {
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
    const redAdjuster = adjuster * red / 256;
    const greenAdjuster = adjuster * green / 256;
    const blueAdjuster = adjuster * blue / 256;
    imageData.data[i] = red + adjuster;
    imageData.data[i + 1] = green + adjuster;
    imageData.data[i + 2] = blue + adjuster;
  }
  context.putImageData(imageData, 0, 0);
}

function tile(callback: (x: number, y: number) => void, width: number, height: number) {
  for (let y = 0; y <= resolution; y += height) {
    for (let x = 0; x <= resolution; x += width) {
      callback(x, y);
    }
  }
}

function tileDrawn() {
  const image = drawContext.getImageData(0, 0, resolution, resolution);
  for (let x = 0; x < 256; x += resolution) {
    for (let y = 0; y < 256; y += resolution) {
      tileContext.putImageData(image, x, y);
    }
  }
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
