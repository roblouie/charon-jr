import { Mesh } from '@/engine/renderer/mesh';
import { materials } from '@/texture-maker';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

function makeRock(start: any, baseScale: number, scaleX: number, scaleY: number, scaleZ: number, noiseSeed: number, noiseScale: number) {
  start.spherify(baseScale).scale(scaleX, scaleY, scaleZ).noisify(noiseSeed, noiseScale).computeNormalsCrossPlane().done();
  return new Mesh(start, materials.marble);
}

export const smallRock = makeRock(new MoldableCubeGeometry(2, 3, 3, 3, 3, 3), 1, 2.3, 1, 2, 3, 0.03);
export const mediumRock = makeRock(new MoldableCubeGeometry(2, 3, 3, 3, 3, 3), 1.4, 3, 1.4, 1.2, 12, 0.04);
export const largeRock = makeRock(new MoldableCubeGeometry(3, 3, 3, 2, 3, 1), 3, 4, 2.3, 2, 22, 0.07);
