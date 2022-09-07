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

  static isMesh(object3d: Object3d): object3d is Mesh  {
    return (object3d as Mesh).geometry !== undefined;
  }
}
