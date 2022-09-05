import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/core/controls';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { drawVolcanicRock } from '@/texture-maker';
import {
  findFloorHeightAtPosition,
  findWallCollisionsFromList,
  getGridPosition, halfLevelSize, maxHalfLevelValue, rayCastCollision
} from '@/engine/physics/surface-collision';
import { audioCtx, engineAudio, hit1Audio, hit2Audio, landingAudio } from '@/engine/audio/audio-player';
import { truck, TruckObject3d } from '@/modeling/truck.modeling';
import { clamp, easeInOut, linearMovement, moveValueTowardsTarget, wrap } from '@/engine/helpers';
import { radsToDegrees } from '@/engine/math-helpers';
import { Spirit } from '@/spirit';

const debugElement = document.querySelector('#debug')!;


export class ThirdPersonPlayer {
  isJumping = false;
  chassisCenter = new EnhancedDOMPoint(0, 0, 0);
  readonly origin = new EnhancedDOMPoint(0, 0, 0);
  frontLeftWheel = new EnhancedDOMPoint();
  frontRightWheel = new EnhancedDOMPoint();
  velocity = new EnhancedDOMPoint(0, 0, 0);


  mesh: TruckObject3d;
  camera: Camera;
  idealPosition = new EnhancedDOMPoint(0, 8, -17);
  idealLookAt = new EnhancedDOMPoint(0, 2, 0);

  listener: AudioListener;

  isCarryingSpirit = false;
  carriedSpirit?: Spirit;

  constructor(camera: Camera) {
    this.mesh = truck;
    this.chassisCenter.y = 10;
    this.camera = camera;
    this.listener = audioCtx.listener;

    engineAudio.loop = true;
    engineAudio.playbackRate.value = 1;
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.4;
    engineAudio.connect(gainNode).connect(audioCtx.destination);
  }

  private transformIdeal(ideal: EnhancedDOMPoint): EnhancedDOMPoint {
    return new EnhancedDOMPoint()
      .set(this.mesh.wrapper.rotationMatrix.transformPoint(ideal))
      .add(this.mesh.position);
  }

  private lastPosition = new EnhancedDOMPoint();
  private distanceTraveled = new EnhancedDOMPoint();
  update(gridFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]}[]) {
    this.updateVelocityFromControls();  // set x / z velocity based on input
    this.velocity.y -= 0.01; // gravity
    this.chassisCenter.add(this.velocity);  // move the player position by the velocity

    this.updateEngineSound();


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
  private jumpTimer = 0;
  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    const rayCollisions = rayCastCollision(groupedFaces.wallFaces, this.lastPosition, this.chassisCenter);
    if (rayCollisions) {
      this.chassisCenter.set(rayCollisions.collision);
    }

    const wallCollisions = findWallCollisionsFromList(groupedFaces.wallFaces, this.chassisCenter, 0.1, 3.5);

    this.chassisCenter.x += wallCollisions.xPush;
    this.chassisCenter.z += wallCollisions.zPush;

    if (wallCollisions.numberOfWallsHit > 0) {
      this.angleTravelingVector.normalize();
      const collisionDot = this.angleTravelingVector.x * wallCollisions.walls[0].normal.x + this.angleTravelingVector.z * wallCollisions.walls[0].normal.z;

      this.speed -= this.speed * (1 - Math.abs(collisionDot));
    }

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.chassisCenter);

    if (!floorData) {
      return;
    }

    const collisionDepth = floorData.height - this.chassisCenter.y;

    if (collisionDepth > 0) {
      if (this.jumpTimer > 20) {
        landingAudio().start();
      }

      this.chassisCenter.y += collisionDepth;
      this.velocity.y = 0;
      this.isJumping = false;
      this.jumpTimer = 0;
      this.axis = this.axis.crossVectors(this.mesh.up, floorData.floor.normal);
      const radians = Math.acos(floorData.floor.normal.dot(this.mesh.up));
      this.mesh.rotationMatrix = new DOMMatrix();
      this.mesh.rotationMatrix.rotateAxisAngleSelf(this.axis.x, this.axis.y, this.axis.z, radsToDegrees(radians));
      this.previousFloorHeight = floorData.height;
    } else {
      this.isJumping = true;
      this.jumpTimer++;
    }
  }

  private gearMultipliers = [3.2, 2.2, 1.5, 1.2];
  private gear = 0;

  private updateEngineSound() {
    if (this.speed < 1.5) {
      this.gear = 0;
    } else if (this.speed >= 1.5 && this.speed < 2.2) {
      this.gear = 1;
    } else if (this.speed >= 2.2 && this.speed < 2.7) {
      this.gear = 2;
    } else {
      this.gear = 3;
    }

    engineAudio.playbackRate.value = Math.max(Math.abs(this.speed) * this.gearMultipliers[this.gear], 0.7);
  }


  private angleTraveling = 0;
  private angleTravelingVector = new EnhancedDOMPoint();
  private anglePointing = 0;
  private slipAngle = 0;

  private steeringAngle = 0;
  private baseTurningAbility = 0.1;
  private turningAbilityPercent = 1;

  private fullTractionStep = 0.07;
  private tractionPercent = 0.6;

  private acceleratorValue = 0;
  private brakeValue = 0;
  private readonly baseDecelerationRate = 0.02;
  private decelerationRate = 0.02;

  private speed = 0;
  private maxSpeed = 3.3;
  private readonly baseAccelerationRate = 0.03;
  private accelerationRate = 0.03;


  private determineAbilityToRotateCar() {
    this.tractionPercent = 0.6;
    this.turningAbilityPercent = 1;

    const percentOfMaxSpeed = this.speed / this.maxSpeed;
    const throttleVsMaxSpeed = this.acceleratorValue - percentOfMaxSpeed;

    this.turningAbilityPercent = easeInOut(percentOfMaxSpeed);

    // In first gear, high throttle causes over-steer
    // if (this.gear === 0) {
    //   const throttleVsSpeedImpact = 0.4;
    //   const throttleEffect = throttleVsMaxSpeed * throttleVsSpeedImpact;
    //
    //   this.tractionPercent -= throttleEffect;
    // }


    // At a base level, you can rotate the car more the faster you go
    // const percentOfMaxSpeed = this.speed / this.maxSpeed;
    // this.currentTurningAbility = this.baseTurningAbility * percentOfMaxSpeed;
    //
    // // The more you press the accelerator at lower speeds, the higher your ability to rotate the car
    // let acceleratorInfluenceOnSteering = 0.01;
    // if (percentOfMaxSpeed > 0) {
    //   this.currentTurningAbility += (this.acceleratorValue / percentOfMaxSpeed) * acceleratorInfluenceOnSteering;
    // }
    //
    // debugElement.textContent = this.acceleratorValue.toString();

    if (this.jumpTimer > 30) {
      this.tractionPercent = 0.2;
      this.turningAbilityPercent = 0.2;
    }

    clamp(this.tractionPercent, 0, 1);
    clamp(this.turningAbilityPercent, 0, 1);
  }

  private reverseTimer = 0;
  private isReversing = false;
  protected updateVelocityFromControls() {
    this.accelerationRate = (this.jumpTimer > 30) ? this.baseAccelerationRate / 3 : this.baseAccelerationRate;
    this.decelerationRate = (this.jumpTimer > 30) ? this.baseDecelerationRate / 3 : this.baseDecelerationRate;


    const baseDrag = 0.01;
    const drag = clamp(this.speed * baseDrag, 0, 0.08);


    this.acceleratorValue = controls.isGamepadAttached ? controls.rightTrigger : Number(controls.isUp);
    this.brakeValue = controls.isGamepadAttached ? controls.leftTrigger : Number(controls.isDown);

    this.speed += this.acceleratorValue * this.accelerationRate;
    this.speed = Math.min(this.speed, this.maxSpeed);

    this.speed -= this.brakeValue * this.decelerationRate;

    this.speed -= drag;

    if (this.speed <= 0 && this.brakeValue > 0.1) {
      this.reverseTimer++;

      if (this.reverseTimer > 20) {
        this.speed -= this.brakeValue * this.decelerationRate;
        this.speed += drag * 2;
        this.isReversing = true;
      }
    }

    if (this.speed > 0) {
      this.reverseTimer = 0;
      this.isReversing = false;
    }

    this.speed = Math.max(this.isReversing ? -1 : 0, this.speed);

    // Steering shouldn't really go as far as -1/1, which the analog stick goes to, so scale down a bit
    // This should also probably use lerp/slerp to move towards the value. There is already a lerp method
    // but not slerp yet, not
    const wheelTurnScale = -0.7;
    this.steeringAngle = moveValueTowardsTarget(this.steeringAngle, controls.direction.x * wheelTurnScale, .05)
    this.mesh.setSteeringAngle(this.steeringAngle);

    this.mesh.setDriveRotationRate(this.speed);

    this.determineAbilityToRotateCar();

    this.anglePointing += this.steeringAngle * this.baseTurningAbility * this.turningAbilityPercent;
    const quarterTurn = Math.PI / 2;
    this.anglePointing = clamp(this.anglePointing, this.angleTraveling - quarterTurn, this.angleTraveling + quarterTurn);
    // Never exceed full circle value


    this.angleTraveling = moveValueTowardsTarget(this.angleTraveling, this.anglePointing, this.fullTractionStep * this.tractionPercent);

    this.angleTraveling = clamp(this.angleTraveling, this.anglePointing - quarterTurn, this.anglePointing + quarterTurn);

    this.angleTravelingVector.set(Math.cos(this.angleTraveling), 0, Math.sin(this.angleTraveling));





    this.slipAngle = this.angleTraveling - this.anglePointing;

    // Once you've drifted up to 90 degrees, just start turning more
    // if (Math.abs(slipAngle) >= Math.PI / 2) {
    //   const difference = slipAngle - (Math.PI / 2);
    //   debugElement.textContent = `${slipAngle} / ${difference}`;
    //
    //   this.angleTraveling += difference;
    // }


    this.velocity.z = Math.cos(this.angleTraveling) * this.speed;
    this.velocity.x = Math.sin(this.angleTraveling) * this.speed;

    this.mesh.wrapper.setRotation(0, this.anglePointing, 0);

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
