import { Player } from '@/player';
import { Camera } from '@/renderer/camera';
import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { Face } from '@/physics/face';
import { controls } from '@/core/controls';

export class ThirdPersonPlayer extends Player {
  camera: Camera;
  idealPosition = new EnhancedDOMPoint(0, 3, -17);
  idealLookAt = new EnhancedDOMPoint(0, 2, 0);

  constructor(camera: Camera) {
    super();
    this.camera = camera;
  }

  private transformIdeal(ideal: EnhancedDOMPoint): EnhancedDOMPoint {
    return new EnhancedDOMPoint()
      .set(this.mesh.rotationMatrix.transformPoint(ideal))
      .add(this.mesh.position);
  }

  update(groupedFaces: { floorFaces: Face[]; wallFaces: Face[] }) {
    super.update(groupedFaces);
    this.camera.position.lerp(this.transformIdeal(this.idealPosition), 0.01);

    // Keep camera away regardless of lerp
    const distanceToKeep = 17;
    const normalizedPosition = this.camera.position.clone().subtract(this.mesh.position).normalize();
    this.camera.position.x = normalizedPosition.x * distanceToKeep + this.mesh.position.x;
    this.camera.position.z = normalizedPosition.z * distanceToKeep + this.mesh.position.z;

    this.camera.lookAt(this.transformIdeal(this.idealLookAt));
    this.camera.updateWorldMatrix();
  }

  protected updateVelocityFromControls() {
    const speed = 0.1;

    const mag = controls.direction.magnitude;
    const inputAngle = Math.atan2(-controls.direction.x, -controls.direction.z);
    const playerCameraDiff = this.mesh.position.clone().subtract(this.camera.position);
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
