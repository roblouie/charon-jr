export function toObjectUrl(svgString: SvgString) {
  return URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }));
}

export async function toImage(svgImageBuilder: SvgString): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = toObjectUrl(svgImageBuilder);
  return new Promise(resolve => image.addEventListener('load', () => resolve(image)));
}

export async function toImageData(svgString: SvgString): Promise<ImageData> {
  const image = await toImage(svgString);
  const canvas = new OffscreenCanvas(image.width, image.height) as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
}

export async function toHeightmap(svgString: SvgString, scale: number): Promise<number[]> {
  const imageData = await toImageData(svgString);
  return [...imageData.data]
    .filter((value, index) => !(index % 4))
    .map(value => {
      return (value / 255 - 0.5) * scale;
    });
}
