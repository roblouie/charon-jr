import { BufferGeometry } from './renderer/buffer-geometry';
import { CubeGeometry } from './cube-geometry';
import { Mesh } from './renderer/mesh';
import { Material } from './renderer/material';

export class Staircase {
  cubes: Mesh[];

  constructor(numberOfSteps: number, stepHeight: number, stepWidth: number, stepDepth: number) {
    this.cubes = [];
    const offset = new DOMPoint(10, 0, 0);
    for (let stepNumber = 0; stepNumber < numberOfSteps; stepNumber++) {
      this.cubes.push(new Mesh(new CubeGeometry(stepWidth, stepHeight, stepDepth, offset.x, offset.y, offset.z), new Material([0, 0, 1, 1])));
      offset.y += stepHeight;
      offset.z += stepDepth;
    }
  }
}