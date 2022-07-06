import { BufferGeometry } from './renderer/buffer-geometry';
import { CubeGeometry } from './cube-geometry';
import { Mesh } from './renderer/mesh';
import { Material } from './renderer/material';
import { textureLoader } from '@/renderer/texture-loader';
import { drawRockWall, drawStoneWalkway, drawVolcanicRock } from '@/textures/texture-maker';

export class Staircase {
  cubes: Mesh[];

  constructor(numberOfSteps: number, stepHeight: number, stepWidth: number, stepDepth: number) {
    this.cubes = [];
    const offset = new DOMPoint(10, -5, 0);
    for (let stepNumber = 0; stepNumber < numberOfSteps; stepNumber++) {
      this.cubes.push(new Mesh(
        new CubeGeometry(stepWidth, stepHeight, stepDepth, offset.x, offset.y, offset.z),
        new Material({texture: textureLoader.load(drawRockWall())})
      ));
      offset.y += stepHeight;
      offset.z += stepDepth;
    }
  }
}
