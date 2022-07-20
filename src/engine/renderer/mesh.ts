import { Object3d } from './object-3d';
import { BufferGeometry } from './buffer-geometry';
import { Material } from './material';

export class Mesh extends Object3d {
  geometry: BufferGeometry;
  material: Material;

  constructor(geometry: BufferGeometry, material: Material) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
}
