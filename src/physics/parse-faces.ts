import { BufferGeometry } from '@/renderer/buffer-geometry';
import { Face } from './face';
import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";

function indexToFaceVertexPoint(index: number, positionData: Float32Array): EnhancedDOMPoint {
  return new EnhancedDOMPoint(
    positionData[index], positionData[index + 1], positionData[index + 2]
  )
}

export function getGroupedFaces(geometries: BufferGeometry[]) {
  const faces = geometries.flatMap(geometry => {
    const indices = geometry.getIndices()!; // assuming always having indices

    const positions = geometry.getPositions();

    const triangles = [];
    for (let i = 0; i < indices.length; i += 3) {
        const firstIndex = indices[i] * 3;
        const secondIndex = indices[i + 1] * 3;
        const thirdIndex = indices[i + 2] * 3;

        const point0 = indexToFaceVertexPoint(firstIndex, positions.data);
        const point1 = indexToFaceVertexPoint(secondIndex, positions.data);
        const point2 = indexToFaceVertexPoint(thirdIndex, positions.data);

      triangles.push([
        point0,
        point1,
        point2,
      ]);
    }

    return triangles.map(triangle => new Face(triangle));
  });

  const floorFaces: Face[] = [];
  const wallFaces: Face[] = [];
  const ceilingFaces: Face[] = [];

  faces.forEach(face => {
    if (face.normal.y > 0.5) {
      floorFaces.push(face);
    } else if (face.normal.y < -0.5) {
      ceilingFaces.push(face);
    } else {
      wallFaces.push(face);
    }
  });

  return {
    floorFaces,
    wallFaces,
    ceilingFaces,
  };
}
