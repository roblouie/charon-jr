import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { Mesh } from '@/engine/renderer/mesh';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { drawVolcanicRock } from '@/texture-maker';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Material } from '@/engine/renderer/material';
import { findFloorHeightAtPosition, findWallCollisionsFromList } from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { Object3d } from '@/engine/renderer/object-3d';
import { truck, TruckObject3d } from '@/modeling/truck.object-3d';
import { clamp } from '@/engine/helpers';

const debugElement = document.querySelector('#debug')!;


export class ThirdPersonPlayer {
  isJumping = false;
  feetCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);
  angle = 0;

  mesh: TruckObject3d;
  camera: Camera;
  idealPosition = new EnhancedDOMPoint(0, 6, -17);
  idealLookAt = new EnhancedDOMPoint(0, 2, 0);

  listener: AudioListener;

  constructor(camera: Camera) {
    textureLoader.load(drawVolcanicRock())
    this.mesh = truck;
    this.feetCenter.y = 10;
    this.camera = camera;
    this.listener = audioCtx.listener;
  }

  private transformIdeal(ideal: EnhancedDOMPoint): EnhancedDOMPoint {
    return new EnhancedDOMPoint()
      .set(this.mesh.rotationMatrix.transformPoint(ideal))
      .add(this.mesh.position);
  }

  update(groupedFaces: { floorFaces: Face[]; wallFaces: Face[] }) {
    this.updateVelocityFromControls();  // set x / z velocity based on input
    this.velocity.y -= 0.003; // gravity
    this.feetCenter.add(this.velocity);  // move the player position by the velocity
    this.collideWithLevel(groupedFaces); // do collision detection, if collision is found, feetCenter gets pushed out of the collision

    this.mesh.position.set(this.feetCenter); // at this point, feetCenter is in the correct spot, so draw the mesh there
    this.mesh.position.y += 0.5; // move up by half height so mesh ends at feet position

    this.camera.position.lerp(this.transformIdeal(this.idealPosition), 0.1);

    // Keep camera away regardless of lerp
    const distanceToKeep = 17;
    const {x, z} = this.camera.position.clone()
      .subtract(this.mesh.position) // distance from camera to player
      .normalize() // direction of camera to player
      .scale(distanceToKeep) // scale direction out by distance, giving us a lerp direction but constant distance
      .add(this.mesh.position); // move back relative to player

    this.camera.position.x = x;
    this.camera.position.z = z;

    this.camera.lookAt(this.transformIdeal(this.idealLookAt));
    this.camera.updateWorldMatrix();

    this.updateAudio()
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
    const speed = 0.3;

    const mag = controls.direction.magnitude;
    const inputAngle = Math.atan2(-controls.direction.x, -controls.direction.z);

    if (controls.direction.x !== 0 || controls.direction.z !== 0) {
      this.angle += inputAngle * 0.05;
    }

    this.velocity.z = Math.cos(this.angle) * mag * speed;
    this.velocity.x = Math.sin(this.angle) * mag * speed;

    // Steering shouldn't really go as far as -1/1, which the analog stick goes to, so scale down a bit
    // This should also probably use lerp/slerp to move towards the value. There is already a lerp method
    // but not slerp yet, not
    const wheelTurnScale = -0.7;
    this.mesh.setSteeringAngle(controls.direction.x * wheelTurnScale);

    // We really need like accelerator vs brake to set the rotation speed of the wheels, this is haggard placeholder
    this.mesh.setDriveRotationRate(clamp(Math.abs(controls.direction.x) + Math.abs(controls.direction.z), -1, 1));

    this.mesh.setRotation(0, this.angle, 0);

    if (controls.isSpace || controls.isJumpPressed) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }

  private updateAudio() {
    this.listener.positionX.value = this.mesh.position.x;
    this.listener.positionY.value = this.mesh.position.y;
    this.listener.positionZ.value = this.mesh.position.z;

    // const cameraDireciton = new EnhancedDOMPoint();
    // cameraDireciton.setFromRotationMatrix(this.camera.rotationMatrix);

    const {x, z} = this.mesh.position.clone()
      .subtract(this.camera.position) // distance from camera to player
      .normalize() // direction of camera to player

    this.listener.forwardX.value = x;
    // this.listener.forwardY.value = cameraDireciton.y;
    this.listener.forwardZ.value = z;
  }
}
