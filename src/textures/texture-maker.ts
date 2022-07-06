import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { NoiseMaker, NoiseType } from '@/textures/noise-maker';

const drawContext = document.querySelector<HTMLCanvasElement>('#draw')!.getContext('2d')!;
const tileContext = document.querySelector<HTMLCanvasElement>('#tile')!.getContext('2d')!;
const workContext = document.querySelector<HTMLCanvasElement>('#work')!.getContext('2d')!;
const noiseContext = document.querySelector<HTMLCanvasElement>('#noise')!.getContext('2d')!;

const directions: EnhancedDOMPoint[] = [];
for (let i = 0; i < 256; i++) {
  directions.push(new EnhancedDOMPoint(
    Math.cos(i * 2.0 * Math.PI / 256),
    Math.sin(i * 2.0 * Math.PI / 256)
  ));
}

const noiseMaker = new NoiseMaker();

drawContext.fillStyle = 'red';
drawContext.fillRect(0, 0, 64, 64);

const resolution = 128;

const positioner = tilePositioner(128, 256);

export function drawCurrentTexture() {
  drawWater(); //tileContext.getImageData(0, 0, 256, 256).data;
  tileDrawn();
}

export function drawTest() {
  clearWith('red');
  drawContext.fillStyle = '#ddd';
  drawContext.fillRect(0, 0, 150, 64);
  return drawContext.getImageData(0, 0, 128, 128).data;
}

export function drawBricks() {
  drawContext.fillStyle = '#ddd';
  drawContext.fillRect(0, 0, resolution, resolution);
  drawContext.fillStyle = 'red';
  drawContext.filter = 'drop-shadow(1px 1px 0px #888)';
  tile((x, y) => {
    const offsetX = (y / 16) % 2 === 0 ? x - 15 : x;
    drawContext.fillRect(offsetX, y + 1, 30, 14);
  }, 32, 16);
  noisify(drawContext, 30);
  return drawContext.getImageData(0, 0, 128, 128).data;
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
  return drawContext.getImageData(0, 0, 128, 128).data;
}

export function drawGrass() {
  clearWith('#090');
  noiseMaker.seed(12);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/32, 3, NoiseType.Perlin, 128, 0, 255, 0), 0, 0);
  drawContext.globalCompositeOperation = 'screen';
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  drawContext.globalCompositeOperation = 'source-over';
  return drawContext.getImageData(0, 0, 128, 128).data;
}

export function drawMarble() {
  clearWith('#ccccab');
  drawContext.globalCompositeOperation = 'color-dodge';
  noiseMaker.seed(23);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 2, NoiseType.Edge, 220, 130, 130, 110, true), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const data = drawContext.getImageData(0, 0, 128, 128).data;
  for (let i = 4; i < data.length; i+= 4) {
    if (data[i] !== 255) {
      debugger;
    }
  }
  return data;
}

export function drawRockWall() {
  clearWith('#933d00');
  drawContext.globalCompositeOperation = 'overlay';
  noiseMaker.seed(33);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 1, NoiseType.Lines, 200, 20, 20, 20, true), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  noisify(drawContext, 2);
  return drawContext.getImageData(0, 0, 128, 128).data;
}

export function drawStoneWalkway() {
  clearWith('#5e6d81');
  noiseMaker.seed(34);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 1, NoiseType.Lines, 220, 1, 1, 30, true), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);

  noiseMaker.seed(34);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 1, NoiseType.Lines, 220, 1, 1, 80, true), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  const data = drawContext.getImageData(0, 0, 128, 128).data;
  for (let i = 3; i < data.length; i+= 4) {
    if (data[i] !== 255) {
      data[i] = 255;
    }
  }
  return data;
}

function drawVolcanicRock() {
  clearWith('#000000');
  // noiseMaker.seed(17);
  noiseMaker.seed(462);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 1, NoiseType.Lines, 130, 255, 0, 0, true), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
}

export function drawWater() {
  clearWith('#030eaf');
  // noiseMaker.seed(17);
  noiseMaker.seed(462);
  // noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 1, NoiseType.Lines, 130, 50, 100, 255, true), 0, 0);
  noiseContext.putImageData(noiseMaker.noiseImage(128, 1/64, 1, NoiseType.Edge, 220, 50, 100, 255), 0, 0);
  drawContext.drawImage(noiseContext.canvas, 0, 0, resolution, resolution);
  return drawContext.getImageData(0, 0, 128, 128).data;
}


function clearWith(color: string, context = drawContext) {
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

function* tilePositioner(textureSize: number, canvasSize: number): Generator<DOMPoint> {
  const currentPosition = new DOMPoint(0, 0);
  while (true) {
    yield currentPosition;
    currentPosition.x += textureSize;
    if (currentPosition.x >= canvasSize) {
      currentPosition.x = 0;
      currentPosition.y += textureSize;
    }
    if (currentPosition.y >= canvasSize) {
      console.warn('too many texture, increase canvas size');
      currentPosition.x = 0;
      currentPosition.y = 0;
    }
  }
}
