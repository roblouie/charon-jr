import { Object3d } from '@/engine/renderer/object-3d';
import { materials } from '@/texture-maker';
import { Mesh } from '@/engine/renderer/mesh';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { createBox } from '@/modeling/base.object3d';

function createTire() {
  return createBox(6, 2, 1, 6, 1, 1)
    .selectBy(vertex => Math.abs(vertex.x) < 2.5 && Math.abs(vertex.z) < 2.5)
    .cylindrify(1.5, 'y')
    .invertSelection()
    .cylindrify(3.5, 'y')
    .all()
    .rotate(0, 0, Math.PI / 2)
    .computeNormalsCrossPlane()
    .done();
}

function createWheel() {
  return new MoldableCubeGeometry(2, 2, 2, 4, 1, 4)
    .selectBy(vertex => Math.abs(vertex.x) > 0.4 && Math.abs(vertex.z) > 0.4)
    .cylindrify(1.5)
    .invertSelection()
    .scale(1, 0.5, 1)
    .all()
    .rotate(0, 0, Math.PI / 2)
    .computeNormalsPerPlane()
    .done();
}

function createWheelAndTire() {
  const wheelGeometry = createWheel();
  const wheel = new Mesh(
    wheelGeometry,
    materials.wheel,
  );

  const tireGeometry = createTire();
  const tire = new Mesh(
    tireGeometry,
    materials.tire,
  );

  const wheelAndTire = new Object3d(new Object3d(wheel, tire));
  wheelAndTire.scale.set(1.5, 0.5, 0.5);
  return wheelAndTire;
}

function createWheelPair() {
  const leftWheel = createWheelAndTire();
  leftWheel.position.x -= 4;

  const rightWheel = createWheelAndTire();
  rightWheel.position.x += 4;

  return new Object3d(leftWheel, rightWheel);
}


function createChassis() {
  const chassisGeometry = new MoldableCubeGeometry(8, 3, 12, 3, 3, 6)
    .selectBy(vertex => vertex.y > 1 && Math.abs(vertex.z) < 3)
    .translate(0, 2, 2)
    .selectBy(vertex => vertex.z > 4)
    .translate(0, 0, 4)
    .selectBy(vertex => vertex.z < -4)
    .translate(0, 0, -1)
    .scale(0.8, 0.8, 1)
    .done();

  const chassis = new Mesh(
    chassisGeometry,
    materials.chassis,
  );
  chassis.position.y += 2;
  chassis.position.z += 1.5;
  chassis.scale.z = 0.9;
  chassis.rotate(0, Math.PI, 0);
  return chassis;
}

export class TruckObject3d extends Object3d {
  frontWheels: Object3d;
  rearWheels: Object3d;
  chassis: Object3d;
  wrapper: Object3d

  constructor(frontWheels: Object3d, rearWheels: Object3d, chassis: Object3d) {
    super(new Object3d(frontWheels, rearWheels, chassis));
    this.wrapper = this.children[0];
    this.frontWheels = frontWheels;
    this.rearWheels = rearWheels;
    this.chassis = chassis;
  }

  get leftFrontWheel() {
    return this.frontWheels.children[0];
  }

  get rightFrontWheel() {
    return this.frontWheels.children[1];
  }

  get allWheels() {
    return [
      ...this.frontWheels.children,
      ...this.rearWheels.children,
    ]
  }

  setSteeringAngle(steeringAngleRadians: number) {
    this.leftFrontWheel.setRotation(0, steeringAngleRadians, 0);
    this.rightFrontWheel.setRotation(0, steeringAngleRadians, 0);
  }

  private rotation = 0;
  setDriveRotationRate(rate: number) {
    this.rotation += rate;
    this.leftFrontWheel.children[0].setRotation(this.rotation, 0, 0);
    this.rightFrontWheel.children[0].setRotation(this.rotation, 0, 0);
    this.rearWheels.setRotation(this.rotation, 0, 0);
  }
}

const frontWheels = createWheelPair();
const rearWheels = createWheelPair();
frontWheels.position.z += 4;
rearWheels.position.z -= 4;
const truckObject = new TruckObject3d(frontWheels, rearWheels, createChassis());
truckObject.scale.set(0.3, 0.3, 0.3);
export const truck = truckObject;
