import { Player } from '@/player';
import { Camera } from '@/renderer/camera';
import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { Face } from '@/physics/face';
import { controls } from '@/core/controls';

export class ThirdPersonPlayer extends Player {
  camera: Camera;

  constructor(camera: Camera) {
    super();
    this.camera = camera;
  }

  private getIdealPosition(): EnhancedDOMPoint {
    let idealOffset = new EnhancedDOMPoint(0, 5, -17);
    const {x, y, z} = this.mesh.rotationMatrix.transformPoint(idealOffset);

    return new EnhancedDOMPoint(x, y, z).plus(this.mesh.position);
  }

  private getIdealLookat() {
    const idealLookAt = new EnhancedDOMPoint(0, 2, 0);
    const { x, y, z } = this.mesh.rotationMatrix.transformPoint(idealLookAt);
    return new EnhancedDOMPoint(x, y, z).plus(this.mesh.position);
  }

  update(groupedFaces: { floorFaces: Face[]; wallFaces: Face[] }) {
    super.update(groupedFaces);
    const idealOffset = this.getIdealPosition();
    this.camera.position.lerp(idealOffset, 0.01);

    // Keep camera away regardless of lerp
    const distanceToKeep = 17;

    const normalizedPosition = this.camera.position.minus(this.mesh.position).normalize();
    const testX = normalizedPosition.x * distanceToKeep;
    const testZ = normalizedPosition.z * distanceToKeep;
    this.camera.position.x = testX + this.mesh.position.x;
    this.camera.position.z = testZ + this.mesh.position.z;

    this.camera.lookAt(this.getIdealLookat());
    this.camera.updateWorldMatrix();
  }

  protected updateVelocityFromControls() {
    const speed = 0.1;

    const mag = controls.direction.magnitude;

    const inputAngle = Math.atan2(-controls.direction.x, -controls.direction.z);

    const playerCameraDiff = this.mesh.position.minus(this.camera.position);
    const playerCameraAngle = Math.atan2(playerCameraDiff.x, playerCameraDiff.z);

    if (controls.direction.x !== 0 || controls.direction.z !== 0) {
      this.angle = inputAngle + playerCameraAngle;
    }

    this.velocity.z = Math.cos(this.angle) * mag * speed;
    this.velocity.x = Math.sin(this.angle) * mag * speed;

    this.mesh.setRotation(0, this.angle, 0);

    if (controls.isSpace || controls.isJumpPressed) {
      if (!this.isJumping) {
        this.velocity.y = 0.15;
        this.isJumping = true;
      }
    }
  }
}
