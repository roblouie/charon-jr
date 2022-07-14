import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { noiseMaker, NoiseType } from '@/texture-creation/noise-maker';

const drawContext = document.querySelector<HTMLCanvasElement>('#draw')!.getContext('2d')!;
const tileContext = document.querySelector<HTMLCanvasElement>('#tile')!.getContext('2d')!;
const noiseContext = document.querySelector<HTMLCanvasElement>('#noise')!.getContext('2d')!;

const resolution = 128;
const debugElement = document.querySelector('#debug')!;


export function drawCurrentTexture() {
  drawStoneWalkway();
    tileDrawn();
}

export function drawSky(zSlice: number) {
  clearWith('#6c93e8');
  noiseMaker.seed(10);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 3, NoiseType.Perlin, '#fff', 170, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
}

export function drawParticle() {
  drawContext.clearRect(0, 0, 128, 128);
  drawContext.fillStyle = 'red';
  drawContext.fillRect(32, 32, 32, 32);
  return mainImageData();
}

export function drawLandscape() {
  clearWith('black');
  noiseContext.putImageData(
    noiseMaker.noiseImage(128, 1 / 64, 3, NoiseType.Perlin, '#fff', 170, true, 'x', 'y', 'z', 134), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
}

export function drawBricks() {
  clearWith('#ddd');
  drawContext.fillStyle = 'red';
  drawContext.filter = 'drop-shadow(1px 1px 0px #888)';
  tile((x, y) => {
    const offsetX = (y / 16) % 2 === 0 ? x - 15 : x;
    drawContext.fillRect(offsetX, y + 1, 30, 14);
  }, 32, 16);
  noisify(drawContext, 30);
  return mainImageData();
}

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

export function drawGrass() {
  clearWith('#090');
  noiseMaker.seed(12);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 32, 3, NoiseType.Perlin, '#0f0', 128), 0, 0);
  drawContext.globalCompositeOperation = 'screen';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  drawContext.globalCompositeOperation = 'source-over';
  return mainImageData();
}

export function drawMarble() {
  clearWith('#ccccab');
  drawContext.globalCompositeOperation = 'color-dodge';
  noiseMaker.seed(23);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 2, NoiseType.Edge, '#82826e', 220, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
}

export function drawRockWall() {
  clearWith('#933d00');
  drawContext.globalCompositeOperation = 'overlay';
  noiseMaker.seed(33);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#141414', 200, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 2);
  return mainImageData();
}

export function drawStoneWalkway() {
  clearWith('#5e6d81');
  noiseMaker.seed(34);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#112', 220, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);

  noiseMaker.seed(34);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#115', 220, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
}

export function drawVolcanicRock() {
  clearWith('#000000');
  noiseMaker.seed(462);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Lines, '#f00', 130, true, 'x', 'y', 'z', 0), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
}

export function drawWater() {
  clearWith('#030eaf');
  noiseMaker.seed(100);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1 / 64, 1, NoiseType.Edge, '#3264ff', 220), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return mainImageData();
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

