import { Mesh } from './renderer/mesh';
import { CubeGeometry } from './cube-geometry';
import { Material } from './renderer/material';
import { findFloorHeightAtPosition, findWallCollisionsFromList } from './physics/surface-collision';
import { Face } from './physics/face';
import { controls } from '@/core/controls';

export class Player {
  isJumping = false;
  feetCenter = new DOMPoint(0, 0, 0);
  velocity = new DOMPoint(0, 0, 0);

  mesh: Mesh;

  constructor() {
    this.mesh = new Mesh(new CubeGeometry(0.1, 1, 0.1), new Material([1, 0, 1, 1]));
    this.feetCenter.y = 10;
  }

  update(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    this.updateVelocityFromControls();
    this.mesh.worldMatrix.transformPoint(this.velocity);
    this.feetCenter.x += this.velocity.x;
    this.feetCenter.z += this.velocity.z;

    const wallCollisions = findWallCollisionsFromList(groupedFaces.wallFaces, this.feetCenter, 0.4, 0.1);
    this.feetCenter.x += wallCollisions.xPush;
    this.feetCenter.z += wallCollisions.zPush;

    this.velocity.y -= 0.003; // gravity
    this.feetCenter.y += this.velocity.y;
    this.collideWithLevel(groupedFaces);

    this.mesh.position.x = this.feetCenter.x; // - 0.25;
    this.mesh.position.z = this.feetCenter.z;  //- 0.25;
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
    if (controls.isRight) {
      this.velocity.x = -0.06;
    } else if (controls.isLeft) {
      this.velocity.x = 0.06;
    } else {
      this.velocity.x = 0;
    }

    if (controls.isUp) {
      this.velocity.z = 0.06;
    } else if (controls.isDown) {
      this.velocity.z = -0.06;
    } else {
      this.velocity.z = 0;
    }


    if (controls.isSpace) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }
}