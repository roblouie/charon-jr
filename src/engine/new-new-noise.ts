import { hexToWebgl } from '@/engine/helpers';
import { filter, rect, svg } from '@/engine/svg-maker/base';
import { feColorMatrix, feComponentTransfer, feFunc, feTurbulence } from '@/engine/svg-maker/filters';
import { toHeightmap } from '@/engine/svg-maker/converters';

export const enum NewNoiseType {
  Turbulence = 'turbulence',
  Fractal = 'fractalNoise',
}

export function noiseImageReplacement(
  size: number,
  seed: number,
  baseFrequency: number | [number, number],
  numOctaves: number,
  type: NewNoiseType,
  fromColor: string,
  toColor: string,
  colorScale = 1,
): SvgString {
  const fromColorArray = hexToWebgl(fromColor);
  const toColorArray = hexToWebgl(toColor);

  return svg({ width: 250, height: 250 },
    filter({ id: 'noise' },
      feTurbulence({ seed, baseFrequency, numOctaves, type }),
      feColorMatrix({ values: [
        0, 0, 0, colorScale, 0,
        0, 0, 0, colorScale, 0,
        0, 0, 0, colorScale, 0,
        0, 0, 0, 0, 1,
      ]}),
      feComponentTransfer(
        feFunc('R', 'table', [fromColorArray[0], toColorArray[0]]),
        feFunc('G', 'table', [fromColorArray[1], toColorArray[1]]),
        feFunc('B', 'table', [fromColorArray[2], toColorArray[2]]),
      ),
    ),
    rect({ x: 0, y: 0, width: '100%', height: '100%', filter: 'noise' }),
  );
}

export async function newNoiseLandscape(size: number,seed: number, frequency: number, octaves: number, noiseType: NewNoiseType, scale: number) {
  const image = noiseImageReplacement(size, seed, frequency, octaves, noiseType, 'black', 'white');
  return toHeightmap(image, scale);
}

export function randomNumber(seed: number): number {
  return (Math.sin(seed * 127.1 + 38481) * 43780) % 1;
}
