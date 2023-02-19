export type LengthOrPercentage = `${number}%` | `${number}` | number;
export type SvgString = `<svg${string}</svg>`;
type FeTurbulenceString = `<feTurbulence${string}/>`;
type FeColorMatrixString = `<feColorMatrix${string}/>`;
type FeDisplacementMapString = `<feDisplacementMap${string}/>`;
type FeFuncString = `<feFunc${string}/>`;
type FeComponentTransferString = `<feComponentTransfer${string}</feComponentTransfer>`;
type FeCompositeString = `<feComposite${string}/>`;
type FeBlendString = `<feBlend${string}/>`;

type FilterElements = FeTurbulenceString | FeColorMatrixString | FeFuncString | FeComponentTransferString | FeDisplacementMapString | FeCompositeString | FeBlendString;
type FilterString = `<filter${string}</filter>`;
type RectString = `<rect${string}/>`;
type EllipseString = `<ellipse${string}/>`;
type TextString = `<text${string}</text>`;

interface HasId {
  id_?: string;
}

interface Placeable {
  x?: LengthOrPercentage;
  y?: LengthOrPercentage;
}

interface Sizeable {
  width?: LengthOrPercentage;
  height?: LengthOrPercentage;
}

interface Filterable {
  filter?: string;
}

interface Drawable {
  fill?: string;
}

interface Styleable {
  style?: string;
}

export const enum NoiseType {
  Turbulence = 'turbulence',
  Fractal = 'fractalNoise',
}

interface FeTurbulenceAttributes extends DoesColorTransformation {
  seed_?: number
  baseFrequency?: number | [number, number];
  numOctaves_?: number;
  type_?: NoiseType;
  result?: string;
  stitchTiles_?: 'stitch' | 'noStitch'
}

interface HasInputs {
  in?: string;
  in2?: string;
}

interface DoesColorTransformation {
  colorInterpolationFilters?: 'sRGB' | 'linearRGB';
}

interface SvgEllipseAttributes extends Filterable {
  cx: LengthOrPercentage,
  cy: LengthOrPercentage,
  rx: LengthOrPercentage,
  ry: LengthOrPercentage,
}

type SvgFilterAttributes = HasId & Placeable & Sizeable;

interface FeColorMatrixAttributes extends DoesColorTransformation {
  in?: string;
  type_?: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha';
  values?: number[];
}

type SvgRectAttributes = Filterable & Placeable & Sizeable & Drawable;

export type SvgTextAttributes = HasId & Filterable & Placeable & Sizeable & Drawable & Styleable;

interface FeBlendAttributes extends HasInputs {
  mode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge'
    | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation'
    | 'color' | 'luminosity';
}

interface FeCompositeAttributes extends HasInputs {
  operator: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'lighter' | 'arithmetic';
}

interface FeDisplacementMapAttributes extends HasInputs, DoesColorTransformation {
  scale_?: number;
}

export type AllSvgAttributes = FeTurbulenceAttributes & SvgEllipseAttributes & HasId
  & FeColorMatrixAttributes & SvgRectAttributes & SvgTextAttributes & FeCompositeAttributes
  & FeDisplacementMapAttributes & FeBlendAttributes & SvgAttributes;

export interface SvgAttributes extends Sizeable, HasId, Styleable {
  viewBox?: string;
}
export function svg(attributes: SvgAttributes, ...elements: string[]): SvgString {
  return `<svg ${attributesToString(attributes)} xmlns="http://www.w3.org/2000/svg">${elements.join('')}</svg>`;
}

export function group(attributes: Filterable, ...elements: string[]) {
  return `<g ${attributesToString(attributes)}>${elements.join('')}</g>`;
}

export function filter(attributes: SvgFilterAttributes, ...filterElements: FilterElements[]): FilterString {
  return `<filter ${attributesToString(attributes)}>${filterElements.join('')}</filter>`;
}

// Rectangle
export function rect(attributes: SvgRectAttributes): RectString {
  return `<rect ${attributesToString(attributes)}/>`;
}

// Ellipse
export function ellipse(attributes: SvgEllipseAttributes): EllipseString {
  return `<ellipse ${attributesToString(attributes)}/>`;
}

// Text
export function text(attributes: SvgTextAttributes, textToDisplay?: any): TextString {
  return `<text ${attributesToString(attributes)}>${textToDisplay ?? ''}</text>`;
}

// Minify-safe attribute converter
export function attributesToString(object: Partial<AllSvgAttributes>) {
  const mapper = {
    'baseFrequency': object.baseFrequency,
    'color-interpolation-filters': object.colorInterpolationFilters,
    'cx': object.cx,
    'cy': object.cy,
    'fill': object.fill,
    'filter': object.filter ? `url(#${object.filter})` : object.filter,
    'height': object.height,
    'id': object.id_,
    'in': object.in,
    'in2': object.in2,
    'mode': object.mode,
    'numOctaves': object.numOctaves_,
    'operator': object.operator,
    'result': object.result,
    'rx': object.rx,
    'ry': object.ry,
    'scale': object.scale_,
    'seed': object.seed_,
    'stitchTiles': object.stitchTiles_,
    'style': object.style,
    'type': object.type_,
    'values': object.values,
    'viewBox': object.viewBox,
    'width': object.width,
    'x': object.x,
    'y': object.y,
  };

  return Object.entries(mapper).map(([key, value]: [string, any]) => value ? `${key}="${value}"` : '').join(' ');
}

// Turbulence
export function feTurbulence(attributes: FeTurbulenceAttributes): FeTurbulenceString {
  // @ts-ignore
  return `<feTurbulence ${attributesToString(attributes)} />`;
}

// Color Matrix
export function feColorMatrix(attributes: FeColorMatrixAttributes): FeColorMatrixString {
  // @ts-ignore
  return `<feColorMatrix ${attributesToString(attributes)}/>`;
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
export function feDisplacementMap(attributes: FeDisplacementMapAttributes): FeDisplacementMapString {
  return `<feDisplacementMap ${attributesToString(attributes)} />`;
}

// Composite
export function feComposite(attributes: FeCompositeAttributes): FeCompositeString {
  return `<feComposite ${attributesToString(attributes)} />`;
}

// Blend
export function feBlend(attributes: FeBlendAttributes): FeBlendString {
  return `<feBlend ${attributesToString(attributes)} />`;
}
