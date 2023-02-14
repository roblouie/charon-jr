import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { Face } from '@/engine/physics/face';
import { controls } from '@/controls';
import {
  findFloorHeightAtPosition,
  findWallCollisionsFromList,
  getGridPosition, maxHalfLevelValue
} from '@/engine/physics/surface-collision';
import { audioCtx } from '@/engine/audio/audio-player';
import { makeTruck, TruckObject3d } from '@/modeling/truck.modeling';
import { clamp, moveValueTowardsTarget, radsToDegrees } from '@/engine/helpers';
import { Spirit } from '@/spirit';
import { hud } from '@/hud';
import { drivingThroughWaterAudio, engineAudio, landingAudio } from '@/sound-effects';

export class ThirdPersonPlayer {
  isJumping = false;
  chassisCenter = new EnhancedDOMPoint(0, 0, 0);
  velocity = new EnhancedDOMPoint(0, 0, 0);

  mesh: TruckObject3d;
  camera: Camera;
  idealPosition = new EnhancedDOMPoint(0, 8, -17);
  idealLookAt = new EnhancedDOMPoint(0, 2, 0);

  listener: AudioListener;

  carriedSpirit?: Spirit;

  drivingThroughWaterGain: GainNode;
  engineGain: GainNode;

  constructor(camera: Camera) {
    this.mesh = makeTruck();
    this.chassisCenter.y = 10;
    this.camera = camera;
    this.listener = audioCtx.listener;

    engineAudio.loop = true;
    engineAudio.playbackRate.value = 1;
    this.engineGain = audioCtx.createGain();
    engineAudio.connect(this.engineGain).connect(audioCtx.destination);
    engineAudio.start();
    this.engineGain.gain.value = 0;
    drivingThroughWaterAudio.loop = true;
    drivingThroughWaterAudio.playbackRate.value = 1;
    this.drivingThroughWaterGain = audioCtx.createGain();
    this.drivingThroughWaterGain.gain.value = 0;
    drivingThroughWaterAudio.connect(this.drivingThroughWaterGain).connect(audioCtx.destination);
    drivingThroughWaterAudio.start();
  }

  private transformIdeal(ideal: EnhancedDOMPoint): EnhancedDOMPoint {
    return new EnhancedDOMPoint()
      .set(this.mesh.wrapper.rotationMatrix.transformPoint(ideal))
      .add(this.mesh.positionO3d);
  }

  private dragRate = 0;
  private jumpTimer = 0;
  private lastIntervalJumpTimer = 0;

  update(gridFaces: {floorFaces: Face[], wallFaces: Face[], ceilingFaces: Face[]}[], waterLevel: number) {
    this.dragRate = 0.99;
    this.drivingThroughWaterGain.gain.value = 0;

    if (this.carriedSpirit && this.jumpTimer - this.lastIntervalJumpTimer > 20) {
      hud.addToScoreBonus();
      this.lastIntervalJumpTimer = this.jumpTimer;
    }

    // If we are diving through water
    if (this.chassisCenter.y - waterLevel < -1) {
      this.dragRate = 0.975;
      this.drivingThroughWaterGain.gain.value = this.speed;
      drivingThroughWaterAudio.playbackRate.value = Math.min(Math.abs(this.speed * 2), 1.2);
    }

    this.updateVelocityFromControls();  // set x / z velocity based on input
    this.velocity.y -= 0.01; // gravity
    this.chassisCenter.add(this.velocity);  // move the player position by the velocity

    this.updateEngineSound();


    // don't let the player leave the level
    const levelBorderBuffer = 10;
    this.chassisCenter.x = clamp(this.chassisCenter.x, -maxHalfLevelValue + levelBorderBuffer, maxHalfLevelValue - levelBorderBuffer);
    this.chassisCenter.z = clamp(this.chassisCenter.z, -maxHalfLevelValue + levelBorderBuffer, maxHalfLevelValue - levelBorderBuffer);

    // if the player falls through the floor, reset them
    if (this.chassisCenter.y < -100) {
      this.chassisCenter.y = 50;
      this.velocity.y = 0;
    }

    const playerGridPosition = getGridPosition(this.chassisCenter);
    this.velocity.y = clamp(this.velocity.y, -1, 1);
    this.collideWithLevel(gridFaces[playerGridPosition]); // do collision detection, if collision is found, feetCenter gets pushed out of the collision

    this.mesh.positionO3d.set(this.chassisCenter); // at this point, feetCenter is in the correct spot, so draw the mesh there
    this.mesh.positionO3d.y += 2; // move up by half height so mesh ends at feet position

    this.camera.positionO3d.lerp(this.transformIdeal(this.idealPosition), 0.07);

    // Keep camera away regardless of lerp
    const distanceToKeep = 17;
    const {x, z} = this.camera.positionO3d.clone()
      .subtract(this.mesh.positionO3d) // distance from camera to player
      .normalizePoint() // direction of camera to player
      .scale(distanceToKeep) // scale direction out by distance, giving us a lerp direction but constant distance
      .add(this.mesh.positionO3d); // move back relative to player

    this.camera.positionO3d.x = x;
    this.camera.positionO3d.z = z;

    this.camera.lookAt(this.transformIdeal(this.idealLookAt));
    this.camera.updateWorldMatrix();

    this.updateAudio();
  }

  private axis = new EnhancedDOMPoint();

  collideWithLevel(groupedFaces: {floorFaces: Face[], wallFaces: Face[]}) {
    const wallCollisions = findWallCollisionsFromList(groupedFaces.wallFaces, this.chassisCenter, 1, 3.5);

    this.chassisCenter.x += wallCollisions.xPush;
    this.chassisCenter.z += wallCollisions.zPush;

    if (wallCollisions.numberOfWallsHit > 0) {
      this.angleTravelingVector.normalizePoint();
      const collisionDot = this.angleTravelingVector.x * wallCollisions.walls[0].normal.x + this.angleTravelingVector.z * wallCollisions.walls[0].normal.z;
      // Play crash sound
      if (wallCollisions.xPush > 0.1 || wallCollisions.zPush > 0.1) {
        landingAudio().start();
      }
      this.speed -= this.speed * (1 - Math.abs(collisionDot));
    }

    const floorData = findFloorHeightAtPosition(groupedFaces!.floorFaces, this.chassisCenter);

    if (!floorData) {
      this.isJumping = true;
      return;
    }

    const collisionDepth = floorData.height - this.chassisCenter.y;

    if (collisionDepth > 0) {
      if (this.jumpTimer > 20) {
        landingAudio().start();
      }

      this.chassisCenter.y += collisionDepth;

      if (collisionDepth < 1.5) {
        this.velocity.y += collisionDepth;
      }

      this.isJumping = false;
      this.jumpTimer = 0;
      this.lastIntervalJumpTimer = 0;
      this.axis = this.axis.crossVectors(this.mesh.up, floorData.floor.normal);
      const radians = Math.acos(floorData.floor.normal.dot(this.mesh.up));
      this.mesh.isUsingLookAt = true;
      this.mesh.rotationMatrix = new DOMMatrix();
      this.mesh.rotationMatrix.rotateAxisAngleSelf(this.axis.x, this.axis.y, this.axis.z, radsToDegrees(radians));
    } else {
      this.isJumping = true;
      this.jumpTimer++;
    }
  }

  private gearRatios = [3.2, 2.2];
  private gear = 0;

  private updateEngineSound() {
    this.gear = this.speed < 1.5 ? 0 : 1;
    engineAudio.playbackRate.value = Math.max((Math.abs(this.speed) - (this.gear * 0.3)) * this.gearRatios[this.gear], 0.7);
  }


  private angleTraveling = 0;
  private angleTravelingVector = new EnhancedDOMPoint();
  private anglePointing = 0;
  private slipAngle = 0;

  private steeringAngle = 0;
  private turningAbilityPercent = 1;

  private tractionPercent = 0.5;

  private readonly baseDecelerationRate = 0.015;
  private decelerationRate = 0.015;

  speed = 0;
  private maxSpeed = 2.1;
  private readonly baseAccelerationRate = 0.021;
  private accelerationRate = 0.021;

  private gripCurve(x: number) {
    if (x < 0.5) {
      return Math.min(8 * x * x * x + x * 1.5, 1);
    } else {
      return Math.min(1 - ((x - 0.5) **2), 1);
    }
  }


  private determineAbilityToRotateCar() {
    this.tractionPercent = 0.6;
    this.turningAbilityPercent = 1;

    const percentOfMaxSpeed = Math.abs(this.speed / this.maxSpeed);
    this.turningAbilityPercent = this.gripCurve(percentOfMaxSpeed);

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
    this.accelerationRate = (this.jumpTimer > 30) ? this.baseAccelerationRate * 0.7 : this.baseAccelerationRate;
    this.decelerationRate = (this.jumpTimer > 30) ? this.baseDecelerationRate / 3 : this.baseDecelerationRate;

    this.speed += controls.accel * this.accelerationRate;
    this.speed = Math.min(this.speed, this.maxSpeed);

    this.speed -= controls.decel * this.decelerationRate;

    this.speed *= this.dragRate;

    if (this.speed <= 0 && controls.decel > 0.1) {
      this.reverseTimer++;

      if (this.reverseTimer > 20) {
        this.speed -= controls.decel * this.decelerationRate;
        this.isReversing = true;
      }
    }

    if (this.speed > 0) {
      this.reverseTimer = 0;
      this.isReversing = false;
    }

    this.speed = Math.max(this.isReversing ? -0.7 : 0, this.speed);

    // Steering shouldn't really go as far as -1/1, which the analog stick goes to, so scale down a bit
    // This should also probably use lerp/slerp to move towards the value. There is already a lerp method
    // but not slerp yet, not
    this.steeringAngle = moveValueTowardsTarget(this.steeringAngle, controls.inputDirection.x * -0.7, .05);
    this.mesh.setSteeringAngle(this.steeringAngle);

    this.mesh.setDriveRotationRate(this.speed);

    this.determineAbilityToRotateCar();

    this.anglePointing += this.steeringAngle * 0.08 * this.turningAbilityPercent * (this.isReversing ? -1 : 1);
    const quarterTurn = Math.PI / 2;
    this.anglePointing = clamp(this.anglePointing, this.angleTraveling - quarterTurn, this.angleTraveling + quarterTurn);
    // Never exceed full circle value


    this.angleTraveling = moveValueTowardsTarget(this.angleTraveling, this.anglePointing, 0.06 * this.tractionPercent);

    this.angleTraveling = clamp(this.angleTraveling, this.anglePointing - quarterTurn, this.anglePointing + quarterTurn);

    this.angleTravelingVector.set(Math.cos(this.angleTraveling), 0, Math.sin(this.angleTraveling));


    this.slipAngle = this.angleTraveling - this.anglePointing;

    this.velocity.z = Math.cos(this.angleTraveling) * this.speed;
    this.velocity.x = Math.sin(this.angleTraveling) * this.speed;

    this.mesh.wrapper.setRotationO3d(0, this.anglePointing, 0);
  }

  private updateAudio() {
    if (this.listener.positionX) {
      this.listener.positionX.value = this.mesh.positionO3d.x;
      this.listener.positionY.value = this.mesh.positionO3d.y;
      this.listener.positionZ.value = this.mesh.positionO3d.z;
    }

    const cameraPlayerDirection = this.mesh.positionO3d.clone()
      .subtract(this.camera.positionO3d) // distance from camera to player
      .normalizePoint() // direction of camera to player

    if (this.listener.forwardX) {
      this.listener.forwardX.value = cameraPlayerDirection.x;
      this.listener.forwardZ.value = cameraPlayerDirection.z;
    }
  }
}
