type LengthOrPercentage = `${number}%` | `${number}` | number;
type SvgString = `<svg${string}</svg>`;
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
