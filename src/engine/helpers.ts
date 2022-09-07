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

export function range(start: number, end: number, interval = 1) {
  let lastValue = start - interval;
  // @ts-ignore
  return new Array(Math.ceil((end - start)/interval)).fill().map(_ => lastValue += interval);
}

export function moveValueTowardsTarget(currentValue: number, maxValue: number, step: number) {
  const isIncrease = maxValue >= currentValue;
  if (isIncrease) {
    return Math.min(currentValue + step, maxValue);
  }
  return Math.max(currentValue - step, maxValue);
}

export function linearMovement(currentValue: number, maxValue: number, percent: number) {
  const percentOfMax = currentValue * percent;
  const amountToMoveBy = percentOfMax * percentOfMax;
  const result = currentValue + amountToMoveBy;
  return result >= maxValue ? Math.min(result, maxValue) : Math.max(result, maxValue);
}

export function wrap(num: number, min: number, max: number): number {
  return ((((num - min) % (max - min)) + (max - min)) % (max - min)) + min;
}

export function easeInOut(x: number) {
  if (x < 0.5) {
    return Math.min(8 * x * x * x + x * 1.5, 1);
  } else {
    return Math.min(1 - ((x - 0.5) **2), 1);
  }
}

export function getRankFromScore(score: number) {
  const scoreThresholds = [30000, 25000, 15000, 10000, 1000, 500, 0];
  const ranks: string[] = ['SS', 'S', 'A', 'B', 'C', 'D', 'F'];
  return ranks.find((rank, index) => score >= scoreThresholds[index])!;
}


export function setToIdentity(matrix: DOMMatrix) {
   matrix.m11 = 1;
   matrix.m12 = 0;
   matrix.m13 = 0;
   matrix.m14 = 0;
   matrix.m21 = 0;
   matrix.m22 = 1;
   matrix.m23 = 0;
   matrix.m24 = 0;
   matrix.m31 = 0;
   matrix.m32 = 0;
   matrix.m33 = 1;
   matrix.m34 = 0;
   matrix.m41 = 0;
   matrix.m42 = 0;
   matrix.m43 = 0;
   matrix.m44 = 1;
}
