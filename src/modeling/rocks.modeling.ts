import { Mesh } from '@/engine/renderer/mesh';
import { materials } from '@/texture-maker';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function makeRock() {
  return new MoldableCubeGeometry(3, 3, 3, 2, 3, 1).spherify(3).scale(4, 2.3, 2).noisify(22, 0.07).computeNormalsCrossPlane().done();
}

// export const largeRock = makeRock(new MoldableCubeGeometry(3, 3, 3, 2, 3, 1), 3, 4, 2.3, 2, 22, 0.07);
