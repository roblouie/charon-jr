import { MoldableCubeGeometry } from './engine/moldable-cube-geometry';
import { Mesh } from './engine/renderer/mesh';
import { Material } from './engine/renderer/material';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { drawRockWall } from '@/texture-maker';

export class Staircase {
  cubes: Mesh[];

  constructor(numberOfSteps: number, stepHeight: number, stepWidth: number, stepDepth: number) {
    this.cubes = [];
    const texture = textureLoader.load(drawRockWall());
    texture.repeat.y = 2;
    const material = new Material({ texture });
    const offset = new DOMPoint(40, -11, -15);
    for (let stepNumber = 0; stepNumber < numberOfSteps; stepNumber++) {
      const mesh = new Mesh(new MoldableCubeGeometry(stepWidth, stepHeight, stepDepth), material);
      mesh.position.x = offset.x;
      mesh.position.y = offset.y;
      mesh.position.z = offset.z;
      this.cubes.push(mesh);
      offset.y += stepHeight;
      offset.z += stepDepth;
    }
  }
}
