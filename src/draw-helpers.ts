import { LengthOrPercentage, svg, SvgAttributes, SvgString, SvgTextAttributes } from '@/engine/svg-maker/base';

export function overlaySvg(additionalAttributes?: Partial<SvgAttributes>, ...elements: string[]): SvgString {
  return svg({...additionalAttributes, viewBox: `0 0 1920 1080` }, ...elements);
}

export function createColumn(x: LengthOrPercentage, startingY: number, baseSpacing: number): (additionalSpacing?: number) => Partial<SvgTextAttributes> {
  return function nextPosition(additionalSpacing?: number) {
    const result = { x, y: startingY + (additionalSpacing ?? 0) };
    startingY = baseSpacing + result.y;
    return result;
  }
}
