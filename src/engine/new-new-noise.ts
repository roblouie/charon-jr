import { hexToWebgl } from '@/engine/helpers';
import {
  feColorMatrix,
  feComponentTransfer, feFunc,
  feTurbulence,
  filter,
  NoiseType,
  rect,
  svg,
  SvgString
} from '@/engine/svg-maker/base';
import { toHeightmap } from '@/engine/svg-maker/converters';

export function noiseImageReplacement(
  size: number,
  seed_: number,
  baseFrequency: number | [number, number],
  numOctaves_: number,
  type_: NoiseType,
  fromColor: string,
  toColor: string,
  colorScale = 1,
): SvgString {
  const fromColorArray = hexToWebgl(fromColor);
  const toColorArray = hexToWebgl(toColor);

  return svg({ width: 256, height: 256 },
    filter({ id_: 'noise' },
      feTurbulence({ seed_, baseFrequency, numOctaves_, type_, stitchTiles_: 'stitch' }),
      feColorMatrix({ colorInterpolationFilters: 'sRGB', values: [
        0, 0, 0, colorScale, 0,
        0, 0, 0, colorScale, 0,
        0, 0, 0, colorScale, 0,
        0, 0, 0, 0, 1,
      ]}),
      feComponentTransfer({},
        feFunc('R', 'table', [fromColorArray[0], toColorArray[0]]),
        feFunc('G', 'table', [fromColorArray[1], toColorArray[1]]),
        feFunc('B', 'table', [fromColorArray[2], toColorArray[2]]),
      ),
    ),
    rect({ x: 0, y: 0, width: '100%', height: '100%', filter: 'noise' }),
  );
}

export async function newNoiseLandscape(size: number,seed: number, frequency: number, octaves: number, noiseType: NoiseType, scale: number) {
  const image = noiseImageReplacement(size, seed, frequency, octaves, noiseType, 'black', 'white', 1);
  return toHeightmap(image, scale);
}

export function randomNumber(seed: number): number {
  return (Math.sin(seed * 127.1 + 38481) * 43780) % 1;
}
