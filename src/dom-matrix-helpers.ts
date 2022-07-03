import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";

export function transposeMatrix(matrix: DOMMatrix) {
  const temp = DOMMatrix.fromMatrix(matrix);

  matrix.m12 = temp.m21;
  matrix.m13 = temp.m31;
  matrix.m14 = temp.m41;

  matrix.m21 = temp.m12;
  matrix.m23 = temp.m32;
  matrix.m24 = temp.m42;

  matrix.m31 = temp.m13;
  matrix.m32 = temp.m23;
  matrix.m34 = temp.m43;

  matrix.m41 = temp.m41;
  matrix.m42 = temp.m42;
  matrix.m43 = temp.m43;

  return matrix;
}

export const identityMatrix = Object.freeze(new DOMMatrix());

export function normalizeVector(vector: EnhancedDOMPoint): EnhancedDOMPoint {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  if (length === 0) {
    return vector;
  }

  return new EnhancedDOMPoint(vector.x / length, vector.y / length, vector.z / length);
}

export function addVectors(vector1: DOMPoint, vector2: DOMPoint): EnhancedDOMPoint {
  return new EnhancedDOMPoint(
    vector1.x + vector2.x,
    vector1.y + vector2.y,
    vector1.z + vector2.z,
  );
}

export function subtractVectors(vector1: DOMPoint, vector2: DOMPoint): EnhancedDOMPoint {
  return new EnhancedDOMPoint(
    vector1.x - vector2.x,
    vector1.y - vector2.y,
    vector1.z - vector2.z,
  );
}

export function crossProductVectors(vector1: EnhancedDOMPoint, vector2: EnhancedDOMPoint): EnhancedDOMPoint {
  return new EnhancedDOMPoint(
    vector1.y * vector2.z - vector1.z * vector2.y,
    vector1.z * vector2.x - vector1.x * vector2.z,
    vector1.x * vector2.y - vector1.y * vector2.x,
  );
}

export function dotProductVectors(vector1: EnhancedDOMPoint, vector2: EnhancedDOMPoint): number {
  return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
}

export function projectVectorOntoVector(vectorToProject: EnhancedDOMPoint, vectorToProjectOnto: EnhancedDOMPoint): EnhancedDOMPoint {
  const normalized = vectorToProjectOnto.normalize();
  const dotProduct = vectorToProject.dot(vectorToProjectOnto);
  return new EnhancedDOMPoint(normalized.x * dotProduct, normalized.y * dotProduct, normalized.z * dotProduct);
}