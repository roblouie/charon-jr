import { noiseMaker, NoiseType } from '@/engine/noise-maker';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { Material } from '@/engine/renderer/material';
import { doTimes, hexToWebgl } from '@/engine/helpers';
import { NewNoiseType, Svg, noiseImageReplacement } from '@/engine/new-noise-maker';

const resolution = 128;

const [drawContext, tileContext, noiseContext] = ['draw', 'tile', 'noise'].map(id => {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.width = id === 'tile' ? 256 : resolution;
  canvas.height = id === 'tile' ? 256 : resolution;
  return canvas.getContext('2d')!;
});


// *********************
// Dirt Path
// *********************
export function drawDirtPath() {
  clearWith('#525200');
  noiseMaker.seed(33);
  noiseContext.putImageData(noiseMaker.noiseImage(resolution, 1 / 16, 4, NoiseType.Perlin, '#804b10', 128), 0, 0);
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
  noiseContext.putImageData(noiseMaker.noiseImage(resolution, 1 / 32, 3, NoiseType.Perlin, '#009303', 128), 0, 0);

  clearWith('#007002');
  // drawContext.globalCompositeOperation = 'screen';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 8);
  const earthGrass = mainImageData();

  noiseMaker.seed(12);
  noiseContext.putImageData(noiseMaker.noiseImage(resolution, 1 / 32, 3, NoiseType.Perlin, '#66b47f', 128), 0, 0);

  clearWith('#45835a');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const purgatoryPlants = mainImageData();

  return { earthGrass, purgatoryPlants };
}

// *********************
// Water
// *********************
export function drawWater() {
  clearWith('#030eaf');
  noiseMaker.seed(10);
  noiseContext.putImageData(noiseMaker.noiseImage(resolution, 1 / 64, 1, NoiseType.Edge, '#3264ff', 220), 0, 0);
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
  const noiseImage = noiseMaker.noiseImage(resolution, 1 / 64, 2, NoiseType.Edge, '#82826e', 220, true, 'x', 'y', 'z', 0);
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
  drawContext.scale(1, -0.7);
  drawContext.textAlign = 'center';
  drawContext.font = '70px Times New Roman';
  drawContext.fillText('RIP', 64, -40);
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
  const noiseImage = noiseMaker.noiseImage(resolution, 1 / 64, 1, NoiseType.Lines, '#141414', 200, true, 'x', 'y', 'z', 0)
  noiseContext.putImageData(noiseImage, 0, 0);

  clearWith('#933d02');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const earthBark = mainImageData();

  clearWith('#320600');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const purgatoryBark = mainImageData();

  clearWith('#9a9a9a');
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const underworldBark = mainImageData();

  return { earthBark, underworldBark, purgatoryBark };
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
  const imageBuilder = new Svg(128).addTurbulence(7, [0.03, 0.03], 1)
    .addColorMatrix([
      0, 0, 0, 0.01, 0.01,
      0, 0, 0, 0.2, 0.1,
      0, 0, 0, 0.03, 0.01,
      0, 0, 0, 0, 1,
    ]);

  return svgImageBuilderTextToImage(imageBuilder);
}


function drawUnderworldGround() {
  const imageBuilder = noiseImageReplacement(128, 8, 0.03, 1, NewNoiseType.Turbulence, '#000522', '#0e3454', 3);

  return svgImageBuilderTextToImage(imageBuilder);
}

export async function newDrawSky(fromColor: string, toColor: string, seed: number, frequency: number | [number, number], octals: number, colorScale = 1) {
  const skyImage = noiseImageReplacement(256, seed, frequency, octals, NewNoiseType.Fractal, fromColor, toColor, colorScale)
  const sidesOfSkybox = [];
  const image = await svgImageBuilderTextToImage(skyImage);
  for (let i = 0; i < 6; i++) {
    sidesOfSkybox.push(image);
  }

  return sidesOfSkybox;
}

async function svgImageBuilderTextToImage(svgImageBuilder: Svg): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = svgImageBuilder.getImage();
  return new Promise(resolve => image.addEventListener('load', () => resolve(image)));
}

// *********************
// Drop Off Point
// *********************
function drawDropoff() {
  const imageBuilder = noiseImageReplacement(128, 100, 1 / 32, 2, NewNoiseType.Fractal, '#0000', '#fff', 1);

  return svgImageBuilderTextToImage(imageBuilder);
}


// *********************
// Underworld Water
// *********************
function drawUnderworldWater() {
  clearWith('#90ca6c'); // '#16e868'
  noiseMaker.seed(10);
  noiseContext.putImageData(noiseMaker.noiseImage(resolution, 1 / 64, 1, NoiseType.Edge, '#2d9f52', 220), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);

  return mainImageData();
}

export const materials: {[key: string]: Material} = {};
export const skyboxes: {[key: string]: TexImageSource[]} = {};

export async function populateSkyboxes() {
  skyboxes.earthSky = await newDrawSky('#fff', '#00f',9, 0.01, 5, 1.8);
  skyboxes.purgatorySky = await newDrawSky('#c1597e', '#e8671c', 100,1/128, 1, 2);
  skyboxes.underworldSky = await newDrawSky('#180625', '#3c1163', 100, 1/128, 6, 1);
}

export async function populateMaterials() {
  const dirtPath = new Material({texture: textureLoader.load(drawDirtPath())})
  dirtPath.texture?.repeat.set(16, 16);
  materials.dirtPath = dirtPath;

  const { earthGrass, purgatoryPlants } = drawGrass();
  const floorTexture = textureLoader.load(earthGrass);
  floorTexture.repeat.x = 12; floorTexture.repeat.y = 12;
  materials.grass = new Material({texture: floorTexture});

  materials.purgatoryGrass = new Material({texture: textureLoader.load(purgatoryPlants) });
  materials.purgatoryGrass.color = [1.0, 0.8, 0.8, 1.0]

  const treeTexture = textureLoader.load(earthGrass);
  treeTexture.repeat.set(2, 2);
  materials.treeLeaves = new Material({texture: treeTexture });


  materials.lake = drawWater();

  materials.tire = new Material({ color: '#000'});
  materials.wheel = new Material({ color: '#888'});

  const underworldPathTexture = textureLoader.load(await drawUnderworldPath());
  underworldPathTexture.repeat.x = 60; underworldPathTexture.repeat.y = 60;
  materials.underworldPath = new Material({texture: underworldPathTexture});

  const underworldGroundTexture = textureLoader.load(await drawUnderworldGround());
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



  const { underworldBark, earthBark, purgatoryBark } = drawTreeBarks();
  materials.underworldBark = new Material({texture: textureLoader.load(underworldBark)});
  materials.purgatoryBark = new Material({texture: textureLoader.load(purgatoryBark)})
  materials.wood = new Material({texture: textureLoader.load(earthBark)});

  materials.dropOff = new Material({texture: textureLoader.load(await drawDropoff())});

  materials.spiritMaterial = new Material({ texture: materials.marble.texture, color: '#fff9', isTransparent: true })
  materials.spiritMaterial.emissive = [1.4, 1.4, 1.4, 1.0];

  const underworldWaterTexture = textureLoader.load(drawUnderworldWater());
  underworldWaterTexture.repeat.x = 10; underworldWaterTexture.repeat.y = 10;
  materials.underworldWater = new Material({texture: underworldWaterTexture, isTransparent: true, color: '#fffc'})

  materials.underworldGrassMaterial = new Material({isTransparent: true, color: '#00D9FFBA'})

  textureLoader.bindTextures();
}



function mainImageData() {
  return drawContext.getImageData(0, 0, resolution, resolution);
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
