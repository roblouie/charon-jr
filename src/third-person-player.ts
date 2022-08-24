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

  speed = 0;
  componentVelocity = new EnhancedDOMPoint(0, 0, 0);
  angle = 0;
  slipAngle = 0;
  steeringAngle = 0;
  framesSpentAtHighSteeringAngle = 0;

  mesh: TruckObject3d;
  camera: Camera;
  idealPosition = new EnhancedDOMPoint(0, 6, -17);
  idealLookAt = new EnhancedDOMPoint(0, 2, 0);

  listener: AudioListener;

  constructor(camera: Camera) {
    textureLoader.load(drawVolcanicRock())
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
  update(gridFaces: Face[][]) {
    this.setSteeringAngle(); // calculate wheel angle and update mesh
    this.updateVelocity();

    this.chassisCenter.add(this.componentVelocity)

    // don't let the player leave the level
    this.chassisCenter.x = clamp(this.chassisCenter.x, -maxHalfLevelValue, maxHalfLevelValue);
    this.chassisCenter.z = clamp(this.chassisCenter.z, -maxHalfLevelValue, maxHalfLevelValue);

    // if the player falls through the floor, reset them
    if (this.chassisCenter.y < -100) {
      this.chassisCenter.y = 50;
      this.componentVelocity.y = 0;
    }

    const playerGridPosition = getGridPosition(this.chassisCenter);
    this.componentVelocity.y = clamp(this.componentVelocity.y, -2, 2);
    this.collideWithLevel({ floorFaces: gridFaces[playerGridPosition], wallFaces: [] }); // do collision detection, if collision is found, feetCenter gets pushed out of the collision


    this.mesh.position.set(this.chassisCenter); // at this point, feetCenter is in the correct spot, so draw the mesh there
    this.mesh.position.y += 0.5; // move up by half height so mesh ends at feet position

    this.positionCamera();

    this.updateAudio()
    this.lastPosition.set(this.chassisCenter);
  }


  protected setSteeringAngle() {
    this.steeringAngle = moveValueTowardsTarget(this.steeringAngle, controls.direction * -0.7, 0.05);
    this.mesh.setSteeringAngle(this.steeringAngle);
  }

  protected updateVelocity() {
    // wind resistance
    this.speed = moveValueTowardsTarget(this.speed, 0, .005);

    // earthbound physics
    if (!this.isJumping) {
      const heightTraveled = this.chassisCenter.y - this.lastPosition.y;
      this.componentVelocity.y += heightTraveled;

      // rolling resistance
      this.speed = moveValueTowardsTarget(this.speed, 0, Math.abs(this.speed) * .009);

      enum ControlState {
        Accelerating,
        Braking,
        Coasting,
      }
      let controlState = ControlState.Coasting;

      if (controls.rightTrigger && this.speed >= 0 || controls.leftTrigger && this.speed <= 0) {
        // accelerating
        controlState = ControlState.Accelerating;
      }

      if (controls.leftTrigger && this.speed > 0 || controls.rightTrigger && this.speed < 0) {
        controlState = ControlState.Braking;
      }

      // inverts target velocity for accel and steering direction if reversing
      const inversionFactor =  controls.leftTrigger && this.speed <= 0 || this.speed < 0 ? -1 : 1;

      switch (controlState) {
        case ControlState.Accelerating:
          // gas pedal percent is trinary, annoyingly. if you're already going forwards, right is gas,
          // if you're going backwards, left is gas, and if you're standing still, the triggers have to duke it out
          let gasPedalPercent;
          if (Math.sign(this.speed) === 0) {
            // case going 0
            gasPedalPercent = Math.max(controls.rightTrigger, controls.leftTrigger);
          } else {
            // cases going forward or backward
            gasPedalPercent = this.speed >= 0 ? controls.rightTrigger : controls.leftTrigger
          }
          this.speed = moveValueTowardsTarget(this.speed, (2 * gasPedalPercent) * inversionFactor, 0.02 * gasPedalPercent);
          break;
        case ControlState.Braking:
          const brakePedalPercent = this.speed > 0 ? controls.leftTrigger : controls.rightTrigger;
          this.speed = moveValueTowardsTarget(this.speed, 0, 0.01 * brakePedalPercent);
          break;
      }

      if (controls.direction) {
        this.angle += this.steeringAngle * 0.05 * inversionFactor * Math.abs(this.speed);
      }

      if (Math.abs(this.steeringAngle) > .65) {
        this.framesSpentAtHighSteeringAngle += 1
      } else {
        this.framesSpentAtHighSteeringAngle = 0;
      }

      // drifting is initiated by number of frames at high steering input. It also continues once started until
      // drift logic return slip angle to 0
      const shouldContinueDrifting = this.slipAngle !== 0;
      const shouldInitiateDrift = this.framesSpentAtHighSteeringAngle && this.speed > .85;
      const driftState = shouldInitiateDrift || shouldContinueDrifting;

      if (controlState === ControlState.Accelerating && driftState) {
        // this.steeringAngle moves to and from control direction. We want player input to directly impact drifting
        // regardless of where the animated wheels are pointed
        const inputAngle = controls.direction * -0.7;
        const targetDriftAngle = inputAngle * this.speed;

        if (inputAngle === 0) {
          // neutral steering decreases drift
          this.slipAngle = moveValueTowardsTarget(this.slipAngle, 0, .025)
        } else {
          // makes for valid Math.sign comparison of slipAngle and inputAngle and makes the truck have some drift momentum
          this.slipAngle = moveValueTowardsTarget(this.slipAngle, targetDriftAngle, .01);
          // determine if in-steer or out-steer. insteer increases angle and out-steer decreases.
          const isInsteer = Math.sign(inputAngle) === Math.sign(this.slipAngle);
          if (isInsteer) {
            // insteer increases angle
            this.slipAngle = moveValueTowardsTarget(this.slipAngle, targetDriftAngle, .05);
          } else {
            // countersteer decreases angle
            this.slipAngle = moveValueTowardsTarget(this.slipAngle, 0, .05);
          }
        }
      } else {
        // accel off pulls slip angle back to 0
        this.slipAngle = moveValueTowardsTarget(this.slipAngle, 0, .035);
      }
    }

    this.componentVelocity.z = Math.cos(this.angle) * this.speed;
    this.componentVelocity.x = Math.sin(this.angle) * this.speed;

    this.mesh.wrapper.setRotation(0, this.angle + this.slipAngle, 0);

    this.mesh.setDriveRotationRate(this.speed);

    if (controls.isSpace || controls.isJumpPressed) {
      if (!this.isJumping) {
        this.componentVelocity.y = 0.15;
        this.isJumping = true;
      }
    }

    /// ramp physics
    const heightTraveled = this.chassisCenter.y - this.lastPosition.y;

    if (!this.isJumping) {
      this.componentVelocity.y += heightTraveled;
    }
    // debugElement.textContent = `
    //     Speed: ${this.speed}
    //     steering angle: ${this.steeringAngle}
    //     Slip Angle: ${this.slipAngle}
    //     Angle: ${this.angle};
    //     is jumping: ${this.isJumping}
    //     isInsteer: ${ Math.sign(controls.direction) === Math.sign(this.slipAngle)}
    //   `;

    // gravity
    this.componentVelocity.y -= 0.005;

  }

  private axis = new EnhancedDOMPoint();
  private previousFloorHeight = 0;
  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    const wallCollisions = findWallCollisionsFromList(groupedFaces.wallFaces, this.chassisCenter, 0.4, 0.1);
    this.chassisCenter.x += wallCollisions.xPush;
    this.chassisCenter.z += wallCollisions.zPush;

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.chassisCenter);

    if (!floorData) {
      return;
    }

    // all position updates here. This needs to be broken off in another method, as this is related to things
    // other than just collision
    const collisionDepth = floorData.height - this.chassisCenter.y;

    if (collisionDepth > -0.2) {
      this.chassisCenter.y += collisionDepth;
      this.componentVelocity.y = 0;
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

  protected positionCamera() {
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
