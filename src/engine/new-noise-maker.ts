import { VectorLike } from '@/engine/enhanced-dom-point';

export enum NewNoiseType {
  Turbulence = 'turbulence',
  Fractal = 'fractalNoise',
}

export class NoiseImage {
  size: number;
  svgData: string[];

  constructor(seed: number,
    size: number,
    frequency: number | [number, number],
    octals: number,
    noiseType = NewNoiseType.Turbulence,
  ) {
    this.size = size;
    this.svgData = [`<feTurbulence baseFrequency="${frequency}" numOctaves="${octals}" type="${noiseType}" seed="${seed}" stitchTiles="stitch" />`];
  }

  addColorMatrix(matrix: number[]) {
    this.svgData.push(`<feColorMatrix values="${matrix.toString()}"/>`);
    return this;
  }

  addComponentTransfer(...feFuncs: string[]) {
    this.svgData.push('<feComponentTransfer>', ...feFuncs, '</feComponentTransfer>');
    return this;
  }

  getImage() {
    const svg = `<svg width="${this.size}" height="${this.size}" xmlns="http://www.w3.org/2000/svg">
          <filter id='filter' x='0%' y='0%' width='100%' height='100%'>
              ${this.svgData.join('')}
          </filter>
          
          <rect x="0" y="0" width="100%" height="100%" filter="url(#filter)" fill="none" />
        </svg>`;
    return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  }

  static makeFeFunc(color: 'R' | 'G' | 'B' | 'A', type: 'linear' | 'discrete' | 'table', values: number[]): string {
    return `<feFunc${color} type="${type}" tableValues="${values}"/>`;
  }
}
