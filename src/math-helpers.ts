import { addVectors, crossProductVectors, normalizeVector, subtractVectors } from '@/dom-matrix-helpers';

export function radsToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

function unormalizedNormal(points: DOMPoint[]): DOMPoint {
  const u = subtractVectors(points[1], points[0]);
  const v = subtractVectors(points[2], points[0]);
  return crossProductVectors(u, v)
}

export function calculateFaceNormal(points: DOMPoint[]): DOMPoint {
  const u = subtractVectors(points[1], points[0]);
  const v = subtractVectors(points[2], points[0]);

  return normalizeVector(crossProductVectors(u, v));
}

export function calculateVertexNormals(points: DOMPoint[], indices: number[]): DOMPoint[] {
  const vertexNormals: DOMPoint[] = Array(points.length).fill(new DOMPoint(0, 0, 0), 0, points.length);
  for (let i = 0; i < indices.length; i+= 3) {
    const faceNormal = unormalizedNormal([points[indices[i]], points[indices[i + 1]], points[indices[i + 2]]]);
    vertexNormals[indices[i]] = addVectors(vertexNormals[indices[i]], faceNormal);
    vertexNormals[indices[i + 1]] = addVectors(vertexNormals[indices[i + 1]], faceNormal);
    vertexNormals[indices[i + 2]] = addVectors(vertexNormals[indices[i + 2]], faceNormal);
  }

  return vertexNormals.map(normalizeVector);
}