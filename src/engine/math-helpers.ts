import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

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

// Not included presently, but is faster than DOMMatrix's built in multiply, so may be useful for performance improvement
// function mulitplyMatrix(a: DOMMatrix, b: DOMMatrix, out: DOMMatrix) {
//   let a00 = a.m11,
//     a01 = a.m12,
//     a02 = a.m13,
//     a03 = a.m14;
//   let a10 = a.m21,
//     a11 = a.m22,
//     a12 = a.m23,
//     a13 = a.m24;
//   let a20 = a.m31,
//     a21 = a.m32,
//     a22 = a.m33,
//     a23 = a.m34;
//   let a30 = a.m41,
//     a31 = a.m42,
//     a32 = a.m43,
//     a33 = a.m44;
//   // Cache only the current line of the second matrix
//   let b0 = b.m11,
//     b1 = b.m12,
//     b2 = b.m13,
//     b3 = b.m14;
//   out.m11 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
//   out.m12 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
//   out.m13 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
//   out.m14 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
//   b0 = b.m21;
//   b1 = b.m22;
//   b2 = b.m23;
//   b3 = b.m24;
//   out.m21 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
//   out.m22 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
//   out.m23 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
//   out.m24 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
//   b0 = b.m31;
//   b1 = b.m32;
//   b2 = b.m33;
//   b3 = b.m34;
//   out.m31 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
//   out.m32 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
//   out.m33 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
//   out.m34 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
//   b0 = b.m41;
//   b1 = b.m42;
//   b2 = b.m43;
//   b3 = b.m44;
//   out.m41 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
//   out.m42 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
//   out.m43 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
//   out.m44 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
//   return out;
// }
