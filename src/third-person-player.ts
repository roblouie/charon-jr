import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { drawVolcanicRock } from '@/texture-maker';
import {
  findFloorHeightAtPosition,
  findWallCollisionsFromList,
  getGridPosition, halfLevelSize, maxHalfLevelValue
} from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { truck, TruckObject3d } from '@/modeling/truck.modeling';
import { clamp, moveValueTowardsTarget } from '@/engine/helpers';
import { radsToDegrees } from '@/engine/math-helpers';

const debugElement = document.querySelector('#debug')!;


export class ThirdPersonPlayer {
  isJumping = false;
  chassisCenter = new EnhancedDOMPoint(0, 0, 0);
  readonly origin = new EnhancedDOMPoint(0, 0, 0);
  frontLeftWheel = new EnhancedDOMPoint();
  frontRightWheel = new EnhancedDOMPoint();
  velocity = new EnhancedDOMPoint(0, 0, 0);
  angle = 0;
  steeringAngle = 0;

  mesh: TruckObject3d;
  camera: Camera;
  idealPosition = new EnhancedDOMPoint(0, 8, -17);
  idealLookAt = new EnhancedDOMPoint(0, 2, 0);

  listener: AudioListener;

  isCarryingSpirit = false;
  carriedSpiritIndex = 0;

  constructor(camera: Camera) {
    this.mesh = truck;
    this.chassisCenter.y = 10;
    this.camera = camera;
    this.listener = audioCtx.listener;
  }

  private transformIdeal(ideal: EnhancedDOMPoint): EnhancedDOMPoint {
    return new EnhancedDOMPoint()
      .set(this.mesh.wrapper.rotationMatrix.transformPoint(ideal))
      .add(this.mesh.position);
  }

  private lastPosition = new EnhancedDOMPoint();
  update(gridFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]}[]) {
    this.updateVelocityFromControls();  // set x / z velocity based on input
    this.velocity.y -= 0.01; // gravity
    this.chassisCenter.add(this.velocity);  // move the player position by the velocity

    // don't let the player leave the level
    this.chassisCenter.x = clamp(this.chassisCenter.x, -maxHalfLevelValue, maxHalfLevelValue);
    this.chassisCenter.z = clamp(this.chassisCenter.z, -maxHalfLevelValue, maxHalfLevelValue);

    // if the player falls through the floor, reset them
    if (this.chassisCenter.y < -100) {
      this.chassisCenter.y = 50;
      this.velocity.y = 0;
    }

    const playerGridPosition = getGridPosition(this.chassisCenter);
    this.velocity.y = clamp(this.velocity.y, -1, 1);
    this.collideWithLevel(gridFaces[playerGridPosition]); // do collision detection, if collision is found, feetCenter gets pushed out of the collision


    // 4 wheels in the right place
    this.frontLeftWheel.set(this.mesh.leftFrontWheel.worldMatrix.transformPoint(this.origin));
    this.frontRightWheel.set(this.mesh.rightFrontWheel.worldMatrix.transformPoint(this.origin));

    debugElement.textContent = `${this.chassisCenter.x}, ${this.chassisCenter.y}, ${this.chassisCenter.z}`;

    const heightTraveled = this.chassisCenter.y - this.lastPosition.y;

    if (!this.isJumping) {
      this.velocity.y += heightTraveled;
    }

    this.mesh.position.set(this.chassisCenter); // at this point, feetCenter is in the correct spot, so draw the mesh there
    this.mesh.position.y += 2; // move up by half height so mesh ends at feet position

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
    this.lastPosition.set(this.chassisCenter);
  }

  private axis = new EnhancedDOMPoint();
  private previousFloorHeight = 0;
  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    const wallCollisions = findWallCollisionsFromList(groupedFaces.wallFaces, this.chassisCenter, 0.8, 0.8);
    this.chassisCenter.x += wallCollisions.xPush;
    this.chassisCenter.z += wallCollisions.zPush;

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.chassisCenter);

    if (!floorData) {
      return;
    }

    const collisionDepth = floorData.height - this.chassisCenter.y;

    if (collisionDepth > 0) {
      this.chassisCenter.y += collisionDepth;
      this.velocity.y = 0;
      this.isJumping = false;
      this.axis = this.axis.crossVectors(this.mesh.up, floorData.floor.normal);
      const radians = Math.acos(floorData.floor.normal.dot(this.mesh.up));
      this.mesh.rotationMatrix = new DOMMatrix();
      this.mesh.rotationMatrix.rotateAxisAngleSelf(this.axis.x, this.axis.y, this.axis.z, radsToDegrees(radians));
      this.previousFloorHeight = floorData.height;
    } else {
      this.isJumping = true;
    }
  }

  protected updateVelocityFromControls() {
    const mag = controls.isGamepadAttached ? controls.rightTrigger : Number(controls.isUp);

    // Steering shouldn't really go as far as -1/1, which the analog stick goes to, so scale down a bit
    // This should also probably use lerp/slerp to move towards the value. There is already a lerp method
    // but not slerp yet, not
    const wheelTurnScale = -0.7;
    this.steeringAngle = moveValueTowardsTarget(this.steeringAngle, controls.direction.x * wheelTurnScale, .05)
    this.mesh.setSteeringAngle(this.steeringAngle);

    // logic to set angle should use controller z input only. Gas and brake can be 'w' and 's' on keyboard, but
    // need button assignments on the controller. angle assignment should happen from calculated steering angle, and
    // eventually, update of truck angle should be contingent on a ground collision check with front wheels.
// We really need like accelerator vs brake to set the rotation speed of the wheels, this is haggard placeholder
    this.mesh.setDriveRotationRate(mag);

    const speed = 1.3;

    const inputAngle = Math.atan2(-controls.direction.x, -controls.direction.z);

    if (controls.direction.x !== 0 || controls.direction.z !== 0) {
      this.angle += inputAngle * 0.05;
    }

    this.velocity.z = Math.cos(this.angle) * mag * speed;
    this.velocity.x = Math.sin(this.angle) * mag * speed;

    this.mesh.wrapper.setRotation(0, this.angle, 0);

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
