import { Mesh } from './renderer/mesh';
import { CubeGeometry } from './cube-geometry';
import { Material } from './renderer/material';
import { findFloorHeightAtPosition, findWallCollisionsFromList } from './physics/surface-collision';
import { Face } from './physics/face';
import { controls } from '@/core/controls';
import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";
import { textureLoader } from '@/renderer/texture-loader';
import { drawVolcanicRock, drawWater } from '@/texture-creation/texture-maker';
import { RampGeometry } from '@/ramp-geometry';

export class Player {
  isJumping = false;
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);
  angle = 0;

  mesh: Mesh;

  constructor() {
    textureLoader.load(drawVolcanicRock())
    this.mesh = new Mesh(
      new RampGeometry(0.3, 1, 0.3),
      new Material({color: '#f0f'})
    );
    this.feetCenter.y = 10;
  }

  update(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    this.updateVelocityFromControls();
    this.mesh.worldMatrix.transformPoint(this.velocity);
    this.velocity.y -= 0.003; // gravity
    this.feetCenter.plusSelf(this.velocity);
    this.collideWithLevel(groupedFaces);

    this.mesh.position.x = this.feetCenter.x;
    this.mesh.position.z = this.feetCenter.z;
    this.mesh.position.y = this.feetCenter.y + 0.5;
  }

  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    const wallCollisions = findWallCollisionsFromList(groupedFaces.wallFaces, this.feetCenter, 0.4, 0.1);
    this.feetCenter.x += wallCollisions.xPush;
    this.feetCenter.z += wallCollisions.zPush;

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.feetCenter);
    if (!floorData) {
      return;
    }

    const collisionDepth = floorData.height - this.feetCenter.y;

    if (collisionDepth > 0) {
      this.feetCenter.y += collisionDepth;
      this.velocity.y = 0;
      this.isJumping = false;
    }
  }


  private updateVelocityFromControls() {
    const speed = 0.2;
    const rotationSpeed = 0.02;
    // this.velocity.x = controls.direction.x * -speed;

    const normalized = controls.direction.normalize();

    if (controls.direction.x !== 0 && controls.direction.z !== 0) {
      this.angle += controls.direction.x * -rotationSpeed;
    }

    this.velocity.z = Math.cos(this.angle) * controls.direction.z * -speed;
    this.velocity.x = Math.sin(this.angle) * controls.direction.z * -speed;

    const debugElement = document.querySelector('#debug')!;

    // debugElement.textContent = `${this.angle}  ${controls.direction.x}, ${controls.direction.y}, ${controls.direction.z}`;

    this.mesh.setRotation(0, this.angle, 0);

    if (controls.isSpace || controls.isJumpPressed) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }
}
