import { Mesh } from '@/engine/renderer/mesh';
import { CubeGeometry } from '../src/engine/cube-geometry';
import { Material } from '@/engine/renderer/material';
import { findFloorHeightAtPosition, findWallCollisionsFromList } from '@/engine/physics/surface-collision';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { EnhancedDOMPoint } from "../src/engine/enhanced-dom-point";
import { textureLoader } from '@/engine/renderer/texture-loader';
import { drawVolcanicRock } from '../src/texture-maker';
import { AttributeLocation } from '@/engine/renderer/renderer';

// Base Player Class
// Very simple movable player that collides properly with the level. While generally this class would live as a base
// class in the project, that will result in some amount of duplicate code. So this lives in tools as a template to
// build real player types from. Take this and add either a third person camera, or first person camera,
// or car physic, etc.

export class Player {
  isJumping = false;
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);
  angle = 0;

  mesh: Mesh;

  constructor() {
    textureLoader.load(drawVolcanicRock())
    this.mesh = new Mesh(
      new CubeGeometry(0.3, 1, 0.3),
      new Material({color: '#f0f'})
    );
    const positions = this.mesh.geometry.getAttribute(AttributeLocation.Positions).data;
    positions[1] = 0;
    positions[16] = 0;
    positions[31] = 0;
    positions[34] = 0;
    positions[61] = 0;
    positions[64] = 0;
    this.feetCenter.y = 10;
  }

  update(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    this.updateVelocityFromControls();
    this.velocity.y -= 0.003; // gravity
    this.feetCenter.add(this.velocity);
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


  protected updateVelocityFromControls() {
    const speed = 0.2;
    const rotationSpeed = 0.02;

    if (controls.direction.x !== 0 && controls.direction.z !== 0) {
      this.angle += controls.direction.x * -rotationSpeed;
    }

    this.velocity.z = Math.cos(this.angle) * controls.direction.z * -speed;
    this.velocity.x = Math.sin(this.angle) * controls.direction.z * -speed;

    this.mesh.setRotation(0, this.angle, 0);

    if (controls.isSpace || controls.isJumpPressed) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }
}
