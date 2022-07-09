const canvas = document.createElement('canvas');
const context = canvas.getContext('2d')!;

export function hexToRgba(hex: string): number[] {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = hex;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data];
}

export function hexToWebgl(hex: string): number[] {
  return hexToRgba(hex).map(val => val / 255);
}
