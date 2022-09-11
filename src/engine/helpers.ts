const canvas = document.createElement('canvas');
const context = canvas.getContext('2d')!;

// DO NOT USE FOR REAL TIME COLOR CHANGES
// This is a very small way to convert color but not a fast one obviously
export function hexToRgba(hex: string): [number, number, number, number] {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = hex;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data] as [number, number, number, number];
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

export function moveValueTowardsTarget(currentValue: number, maxValue: number, step: number) {
  const isIncrease = maxValue >= currentValue;
  if (isIncrease) {
    return Math.min(currentValue + step, maxValue);
  }
  return Math.max(currentValue - step, maxValue);
}

export function gripCurve(x: number) {
  if (x < 0.5) {
    return Math.min(8 * x * x * x + x * 1.5, 1);
  } else {
    return Math.min(1 - ((x - 0.5) **2), 1);
  }
}

export function getRankFromScore(score: number) {
  const scoreThresholds = [25000, 15000, 10000, 1000, 500, 0];
  const ranks: string[] = ['S', 'A', 'B', 'C', 'D', 'F'];
  return ranks.find((rank, index) => score >= scoreThresholds[index])!;
}
