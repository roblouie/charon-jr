import { Object3d } from './object-3d';
import { Material } from './material';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export class Mesh extends Object3d {
  geometry: MoldableCubeGeometry;
  material: Material;

  constructor(geometry: MoldableCubeGeometry, material: Material) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
}
