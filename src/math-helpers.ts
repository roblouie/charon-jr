import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";

export function radsToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

function unormalizedNormal(points: EnhancedDOMPoint[]): EnhancedDOMPoint {
  const u = points[1].minus(points[0]);
  const v = points[2].minus(points[0]);
  return u.cross(v);
}

export function calculateFaceNormal(points: EnhancedDOMPoint[]): EnhancedDOMPoint {
  return unormalizedNormal(points).normalize();
}

export function calculateVertexNormals(points: EnhancedDOMPoint[], indices: number[]): EnhancedDOMPoint[] {
  const vertexNormals: EnhancedDOMPoint[] = Array(points.length).fill(new EnhancedDOMPoint(0, 0, 0), 0, points.length);
  for (let i = 0; i < indices.length; i+= 3) {
    const faceNormal = unormalizedNormal([points[indices[i]], points[indices[i + 1]], points[indices[i + 2]]]);
    vertexNormals[indices[i]] = vertexNormals[indices[i]].plus(faceNormal);
    vertexNormals[indices[i + 1]] = vertexNormals[indices[i + 1]].plus(faceNormal);
    vertexNormals[indices[i + 2]] = vertexNormals[indices[i + 2]].plus(faceNormal);
  }

  return vertexNormals.map(vector => vector.normalize());
}