import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

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

export function getRankFromScore(score: number) {
  const scoreThresholds = [40000, 20000, 10000, 1000, 500, 0];
  const ranks: string[] = ['S', 'A', 'B', 'C', 'D', 'F'];
  return ranks.find((rank, index) => score >= scoreThresholds[index])!;
}

export function radsToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

function unormalizedNormal(points: EnhancedDOMPoint[]): EnhancedDOMPoint {
  const u = points[2].clone().subtract(points[1]);
  const v = points[0].clone().subtract(points[1]);
  return new EnhancedDOMPoint().crossVectors(u, v)
}

export function calculateFaceNormal(points: EnhancedDOMPoint[]): EnhancedDOMPoint {
  return unormalizedNormal(points).normalize();
}

export function calculateVertexNormals(points: EnhancedDOMPoint[], indices: number[] | Uint16Array): EnhancedDOMPoint[] {
  const vertexNormals = points.map(point => new EnhancedDOMPoint());
  for (let i = 0; i < indices.length; i+= 3) {
    const faceNormal = unormalizedNormal([points[indices[i]], points[indices[i + 1]], points[indices[i + 2]]]);
    vertexNormals[indices[i]].add(faceNormal);
    vertexNormals[indices[i + 1]].add(faceNormal);
    vertexNormals[indices[i + 2]].add(faceNormal);
  }

  return vertexNormals.map(vector => vector.normalize());
}
