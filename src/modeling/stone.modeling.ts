import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function makeRock() {
  return new MoldableCubeGeometry(3, 3, 3, 2, 3, 1).spherify(3).scale(4, 2.3, 2).noisify(22, 0.07).computeNormalsCrossPlane().done();
}


export function makeTombstoneGeo(width: number, height: number, depth: number, topRadius: number, widthSegments: number, xRotation = 0) {
  return new MoldableCubeGeometry(width, height, depth, widthSegments, 1, 1)
    .selectBy(vertex => vertex.y > 0)
    .cylindrify(topRadius, 'z')
    .all()
    .rotate(xRotation)
    .computeNormalsPerPlane()
    .done();
}

// export const largeRock = makeRock(new MoldableCubeGeometry(3, 3, 3, 2, 3, 1), 3, 4, 2.3, 2, 22, 0.07);
