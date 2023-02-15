import { attributesToString } from '@/engine/svg-maker/base';

export const NewNoiseType = {
  Turbulence: 'turbulence',
  Fractal: 'fractalNoise',
}

interface HasInputs {
  in?: string;
  in2?: string;
}

interface DoesColorTransformation {
  colorInterpolationFilters?: 'sRGB' | 'linearRGB';
}

// Turbulence
interface FeTurbulenceAttributes extends DoesColorTransformation {
  seed_?: number
  baseFrequency?: number | [number, number];
  numOctaves_?: number;
  type_?: typeof NewNoiseType;
  result?: string;
  stitchTiles?: 'stitch' | 'noStitch'
}
export function feTurbulence(attributes: FeTurbulenceAttributes): FeTurbulenceString {
  return `<feTurbulence ${colorTransformAttribute(attributes)} ${attributesToString(attributes, 'seed_', 'baseFrequency', 'numOctaves_', 'type_', 'result', 'stitchTiles')} />`;
}

// Color Matrix
interface FeColorMatrixAttributes extends DoesColorTransformation {
  in?: string;
  type_?: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha';
  values?: number[];
}
export function feColorMatrix(attributes: FeColorMatrixAttributes): FeColorMatrixString {
  return `<feColorMatrix ${colorTransformAttribute(attributes)} ${attributesToString(attributes, 'in', 'type_', 'values')}/>`;
}

// Component Transfer
interface FeComponentTransferAttributes extends DoesColorTransformation {
  in?: string;
}
export function feComponentTransfer(attributes: FeComponentTransferAttributes, ...feFuncs: FeFuncString[]): FeComponentTransferString {
  return `<feComponentTransfer color-interpolation-filters="sRGB">${feFuncs.join('')}</feComponentTransfer>`;
}

export function feFunc(color: 'R' | 'G' | 'B' | 'A', type: 'linear' | 'discrete' | 'table', values: number[]): FeFuncString {
  return `<feFunc${color} type="${type}" tableValues="${values}"/>`;
}

// Displacement Map
interface FeDisplacementMapAttributes extends HasInputs, DoesColorTransformation {
  scale_?: number;
}
export function feDisplacementMap(attributes: FeDisplacementMapAttributes): FeDisplacementMapString {
  return `<feDisplacementMap ${colorTransformAttribute(attributes)} ${attributesToString(attributes, 'in', 'in2', 'scale_')} />`;
}

// Composite
interface FeCompositeAttributes extends HasInputs {
  operator: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'lighter' | 'arithmetic';
}
export function feComposite(attributes: FeCompositeAttributes): FeCompositeString {
  return `<feComposite ${attributesToString(attributes, 'in', 'in2', 'operator')} />`;
}

// Blend
interface FeBlendAttributes extends HasInputs {
  mode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge'
    | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation'
    | 'color' | 'luminosity';
}
export function feBlend(attributes: FeBlendAttributes): FeBlendString {
  return `<feBlend ${attributesToString(attributes, 'in', 'in2', 'mode')} />`;
}

// Helpers
function colorTransformAttribute(attributes: DoesColorTransformation): string {
  return attributes.colorInterpolationFilters ? `color-interpolation-filters="${attributes.colorInterpolationFilters}"` : '';
}
