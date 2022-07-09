import { BufferGeometry } from './renderer/buffer-geometry';
import { CubeGeometry } from './cube-geometry';
import { Mesh } from './renderer/mesh';
import { Material } from './renderer/material';
import { textureLoader } from '@/renderer/texture-loader';
import { drawRockWall, drawStoneWalkway, drawVolcanicRock } from '@/texture-creation/texture-maker';

export class Staircase {
  cubes: Mesh[];

  constructor(numberOfSteps: number, stepHeight: number, stepWidth: number, stepDepth: number) {
    this.cubes = [];
    const texture = textureLoader.load(drawRockWall());
    texture.repeat.y = 2;
    const offset = new DOMPoint(40, -11, -15);
    for (let stepNumber = 0; stepNumber < numberOfSteps; stepNumber++) {
      this.cubes.push(new Mesh(
        new CubeGeometry(stepWidth, stepHeight, stepDepth, offset.x, offset.y, offset.z),
        new Material({ texture })
      ));
      offset.y += stepHeight;
      offset.z += stepDepth;
    }
  }
}
