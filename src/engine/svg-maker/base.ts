export function svg(attributes: Sizeable, ...elements: string[]): SvgString {
  return `<svg ${attributesToString(attributes, 'width', 'height')} xmlns="http://www.w3.org/2000/svg">${elements.join('')}</svg>`;
}

export function group(attributes: Filterable, ...elements: string[]) {
  return `<g ${filterableAttribute(attributes)}>${elements.join('')}</g>`;
}

interface SvgFilterAttributes extends Placeable, Sizeable {
  id?: string;
}
export function filter(attributes: SvgFilterAttributes, ...filterElements: FilterElements[]): FilterString {
  return `<filter ${attributesToString(attributes, 'id', 'x', 'y', 'width', 'height')}>${filterElements.join('')}</filter>`;
}

// Rectangle
type SvgRectAttributes = Filterable & Placeable & Sizeable;
export function rect(attributes: SvgRectAttributes): RectString {
  return `<rect ${attributesToString(attributes, 'x', 'y', 'width', 'height')} ${filterableAttribute(attributes)} />`;
}

// Ellipse
interface SvgEllipseAttributes extends Filterable {
  cx: LengthOrPercentage,
  cy: LengthOrPercentage,
  rx: LengthOrPercentage,
  ry: LengthOrPercentage,
}
export function ellipse(attributes: SvgEllipseAttributes): EllipseString {
  return `<ellipse ${attributesToString(attributes, 'cx', 'cy', 'rx', 'ry')} ${filterableAttribute(attributes)}/>`;
}

// Minify-safe attribute converter
export function attributesToString<Type, Key extends keyof Type & string>(object: Type, ...keys: Key[]): string {
  return keys.reduce((acc: string, currentKey) => (object[currentKey] ? `${acc} ${currentKey}="${object[currentKey]}"` : acc), '');
}

function filterableAttribute(attributeObject: Filterable): string {
  return attributeObject.filter ? `filter="url(#${attributeObject.filter})"` : '';
}
