export function svg(attributes: Sizeable, ...elements: string[]): SvgString {
  return `<svg ${attributesToString(attributes, 'width', 'height')} xmlns="http://www.w3.org/2000/svg">${elements.join('')}</svg>`;
}

export function group(attributes: Filterable, ...elements: string[]) {
  return `<g ${filterableAttribute(attributes)}>${elements.join('')}</g>`;
}

interface SvgFilterAttributes extends Placeable, Sizeable {
  id_?: string;
}
export function filter(attributes: SvgFilterAttributes, ...filterElements: FilterElements[]): FilterString {
  return `<filter ${attributesToString(attributes, 'id_', 'x', 'y', 'width', 'height')}>${filterElements.join('')}</filter>`;
}

// Rectangle
type SvgRectAttributes = Filterable & Placeable & Sizeable & Drawable;
export function rect(attributes: SvgRectAttributes): RectString {
  return `<rect ${attributesToString(attributes, 'x', 'y', 'width', 'height', 'fill')} ${filterableAttribute(attributes)} />`;
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

// Text
type SvgTextAttributes = Filterable & Placeable & Sizeable & Drawable & Styleable;
export function text(attributes: SvgTextAttributes, textToDisplay: string): TextString {
  return `<text ${attributesToString(attributes, 'x', 'y', 'width', 'height', 'fill', 'style')}>${textToDisplay}</text>`;
}

// Minify-safe attribute converter
export function attributesToString<Type, Key extends keyof Type & string>(object: Type, ...keys: Key[]): string {
  return keys.reduce((acc: string, currentKey) => (object[currentKey] ? `${acc} ${currentKey.replace('_', '')}="${object[currentKey]}"` : acc), '');
}

function filterableAttribute(attributeObject: Filterable): string {
  return attributeObject.filter ? `filter="url(#${attributeObject.filter})"` : '';
}
