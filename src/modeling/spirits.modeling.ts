import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { Material } from '@/engine/renderer/material';

export const spiritGeometry = new MoldableCubeGeometry(3, 12, 3, 2, 1, 2).cylindrify(2).translate(0, 3).done();
  // const spiritGeometry = //new Mesh(spiritGeometry, new Material({ color: '#f0f'}))
