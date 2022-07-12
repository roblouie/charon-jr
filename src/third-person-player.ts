import { Player } from '@/player';
import { Camera } from '@/renderer/camera';
import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { Face } from '@/physics/face';
import { controls } from '@/core/controls';

export class ThirdPersonPlayer extends Player {
  camera: Camera;
  currentLookAt = new EnhancedDOMPoint();
  currentPosition = new EnhancedDOMPoint(0, 5, -17);

  constructor(camera: Camera) {
    super();
    this.camera = camera;
  }

  private getIdealPosition() {
    let idealOffset = new EnhancedDOMPoint(0, 5, -17);
    const {x, y, z} = this.mesh.rotationMatrix.transformPoint(idealOffset);
    return new EnhancedDOMPoint(x, y, z).plus(this.mesh.position);
  }

  private getIdealLookat() {
    const idealLookAt = new EnhancedDOMPoint(0, 2, 17);
    const { x, y, z } = this.mesh.rotationMatrix.transformPoint(idealLookAt);
    return new EnhancedDOMPoint(x, y, z).plus(this.mesh.position);
  }

  update(groupedFaces: { floorFaces: Face[]; wallFaces: Face[] }) {
    const debugElement = document.querySelector('#debug')!;

    super.update(groupedFaces);
    const idealOffset = this.getIdealPosition();
    // debugElement.textContent = distanceToIdealOffset.magnitude.toString();

    this.camera.position.lerp(idealOffset, 0.01);
    this.camera.lookAt(this.mesh.position);
    this.camera.updateWorldMatrix();

    // super.update(groupedFaces);
    // // setup
    // const { x, y, z } = this.camera.position;
    // const p = new DOMPoint(x, z, 0);
    // const cx = this.mesh.position.x;
    // const cy = this.mesh.position.z;
    //
    // const s = Math.sin(this.testAngle);
    // const c = Math.cos(this.testAngle);
    // this.testAngle;
    //
    // // translate point back to origin:
    // p.x -= cx;
    // p.y -= cy;
    //
    // // rotate point
    // const xnew = p.x * c - p.y * s;
    // const ynew = p.x * s + p.y * c;
    //
    // // translate point back:
    // p.x = xnew + cx;
    // p.y = ynew + cy;
    //
    // this.camera.position.x = p.x;
    // this.camera.position.z = p.y;
    // this.camera.position.y = 5;
    //
    // this.camera.lookAt(this.mesh.position);
    // // this.camera.setRotation(-cameraRotation.x, -cameraRotation.y, -cameraRotation.z);
    // this.camera.updateWorldMatrix();
  }

  protected updateVelocityFromControls() {
    const speed = 0.2;
    const rotationSpeed = 0.02;
    // this.velocity.x = controls.direction.x * -speed;

    const mag = controls.direction.magnitude;

    const inputAngle = Math.atan2(-controls.direction.x, -controls.direction.z);
    const debugElement = document.querySelector('#debug')!;

    // const cameraYaw = new EnhancedDOMPoint().setFromRotationMatrix(this.camera.rotationMatrix).y;
    // debugElement.textContent = cameraYaw.toString();

    const playerCameraDiff = this.mesh.position.minus(this.camera.position);
    const playerCameraAngle = Math.atan2(playerCameraDiff.x, playerCameraDiff.z);

    if (controls.direction.x !== 0 || controls.direction.z !== 0) {
      this.angle = inputAngle + playerCameraAngle;
    }

    this.velocity.z = Math.cos(this.angle) * mag * speed;
    this.velocity.x = Math.sin(this.angle) * mag * speed;


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
