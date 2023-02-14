import { hexToWebgl } from '@/engine/helpers';

export const enum NewNoiseType {
  Turbulence = 'turbulence',
  Fractal = 'fractalNoise',
}

export class Svg {
  size: number;
  filterComponents: string[] = [];
  shapes: string[] = [];

  constructor(size: number) {
    this.size = size;
  }

  addRect(fill: string, x = 0, y = 0, width = '100%', height = '100%') {
    this.shapes.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`);
    return this;
  }

  addTurbulence(seed: number, frequency: number | [number, number], octaves: number, noiseType = NewNoiseType.Turbulence) {
    this.filterComponents.push(`<feTurbulence baseFrequency="${frequency}" numOctaves="${octaves}" type="${noiseType}" seed="${seed}" stitchTiles="stitch" />`);
    return this;
  }

  addColorMatrix(matrix: number[]) {
    this.filterComponents.push(`<feColorMatrix color-interpolation-filters="sRGB" values="${matrix.toString()}"/>`);
    return this;
  }

  addComponentTransfer(...feFuncs: string[]) {
    this.filterComponents.push('<feComponentTransfer color-interpolation-filters="sRGB">', ...feFuncs, '</feComponentTransfer>');
    return this;
  }

  getImage() {
    const svg = `<svg width="${this.size}" height="${this.size}" xmlns="http://www.w3.org/2000/svg">
          <filter id='filter' x='0%' y='0%' width='100%' height='100%'>
              ${this.filterComponents.join('')}
          </filter>
          
          ${this.shapes.join('')}
          <rect x="0" y="0" width="100%" height="100%" filter="url(#filter)" />
        </svg>`;
    return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  }

  static feFunc(color: 'R' | 'G' | 'B' | 'A', type: 'linear' | 'discrete' | 'table', values: number[]): string {
    return `<feFunc${color} type="${type}" tableValues="${values}"/>`;
  }
}

export function noiseImageReplacement(
  size: number,
  seed: number,
  frequency: number | [number, number],
  octals: number,
  noiseType: NewNoiseType,
  fromColor: string,
  toColor: string,
  colorScale = 1,
): Svg {
  const fromColorArray = hexToWebgl(fromColor);
  const toColorArray = hexToWebgl(toColor);

  return new Svg(size)
    .addTurbulence(seed, frequency, octals, noiseType)
    .addColorMatrix([
      0, 0, 0, colorScale, 0,
      0, 0, 0, colorScale, 0,
      0, 0, 0, colorScale, 0,
      0, 0, 0, 1, 0,
    ])
    .addComponentTransfer(
      Svg.feFunc('R', 'table', [fromColorArray[0], toColorArray[0]]),
      Svg.feFunc('G', 'table', [fromColorArray[1], toColorArray[1]]),
      Svg.feFunc('B', 'table', [fromColorArray[2], toColorArray[2]]),
      Svg.feFunc('A', 'table', [fromColorArray[3], toColorArray[3]]),
    );
}

export async function svgImageBuilderTextToImage(svgImageBuilder: Svg): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = svgImageBuilder.getImage();
  return new Promise(resolve => image.addEventListener('load', () => resolve(image)));
}

export async function svgImageBuilderToHeightmapValues(svgImageBuilder: Svg, scale: number): Promise<number[]> {
  const { size } = svgImageBuilder;
  const canvas = new OffscreenCanvas(size, size) as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;
  context.drawImage(await svgImageBuilderTextToImage(svgImageBuilder), 0, 0);
  return [...context.getImageData(0, 0, size, size).data]
    .filter((value, index) => !(index % 4))
    .map(value => {
      return (value / 255 - 0.5) * scale;
    });
}

export async function newNoiseLandscape(size: number,seed: number, frequency: number, octaves: number, noiseType: NewNoiseType, scale: number) {
  const image = noiseImageReplacement(size, seed, frequency, octaves, noiseType, 'black', 'white');
  return svgImageBuilderToHeightmapValues(image, scale);
}

export function randomNumber(seed: number): number {
  return (Math.sin(seed * 127.1 + 38481) * 43780) % 1;
}
