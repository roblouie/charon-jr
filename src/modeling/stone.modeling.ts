import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function makeRock() {
  return new MoldableCubeGeometry(3, 3, 3, 2, 3, 1).spherify(3).scale(4, 2.3, 2).noisify(22, 0.07).computeNormalsCrossPlane().done();
}


export function makeTombstoneGeo(width: number, height: number, depth: number, topRadius: number) {
  return new MoldableCubeGeometry(width, height, depth, 18, 1, 4)
    .selectBy(vertex => vertex.y > 0)
    .cylindrify(topRadius, 'z')
    .done();
}

// export const largeRock = makeRock(new MoldableCubeGeometry(3, 3, 3, 2, 3, 1), 3, 4, 2.3, 2, 22, 0.07);
