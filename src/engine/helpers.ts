const canvas = document.createElement('canvas');
const context = canvas.getContext('2d')!;

// DO NOT USE FOR REAL TIME COLOR CHANGES
// This is a very small way to convert color but not a fast one obviously
export function hexToRgba(hex: string): number[] {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = hex;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data];
}

// DO NOT USE FOR REAL TIME COLOR CHANGES
// This is a very small way to convert color but not a fast one obviously
export function hexToWebgl(hex: string): number[] {
  return hexToRgba(hex).map(val => val / 255);
}

export function doTimes(times: number, callback: (index: number) => void) {
  for (let i = 0; i < times; i++) {
    callback(i);
  }
}


export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
