import { Object3d } from './object-3d';

export class Camera extends Object3d {
  projection: DOMMatrix;

  constructor(fieldOfViewRadians: number, aspect: number, near: number, far: number) {
    super();

    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewRadians);
    const rangeInv = 1.0 / (near - far);

    this.projection = new DOMMatrix([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  }
}
