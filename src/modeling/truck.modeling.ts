import { Object3d } from '@/engine/renderer/object-3d';
import { materials, truckColor } from '@/texture-maker';
import { Mesh } from '@/engine/renderer/mesh';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { createBox } from '@/modeling/building-blocks.modeling';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Material } from '@/engine/renderer/material';

function createTire() {
  return createBox(6, 2, 1, 6, 1, 1)
    .selectBy(vertex => Math.abs(vertex.x) < 2.5 && Math.abs(vertex.z) < 2.5)
    .cylindrify(1.5, 'y')
    .invertSelection()
    .cylindrify(3.5, 'y')
    .all_()
    .rotate_(0, 0, Math.PI / 2)
    .computeNormalsCrossPlane()
    .done_();
}

function createWheel() {
  return new MoldableCubeGeometry(2, 2, 2, 4, 1, 4)
    .selectBy(vertex => Math.abs(vertex.x) > 0.4 && Math.abs(vertex.z) > 0.4)
    .cylindrify(1.5)
    .invertSelection()
    .scale_(1, 0.5, 1)
    .all_()
    .rotate_(0, 0, Math.PI / 2)
    .computeNormalsPerPlane()
    .done_();
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
  wheelAndTire.scale_.set(1.1, 0.6, 0.6);
  return wheelAndTire;
}

function createWheelPair() {
  const leftWheel = createWheelAndTire();
  leftWheel.position_.x -= 4.5;

  const rightWheel = createWheelAndTire();
  rightWheel.position_.x += 4.5;

  return new Object3d(leftWheel, rightWheel);
}


function createChassis() {
  const texturesPerSide = MoldableCubeGeometry.TexturePerSide(3, 3, 5,
    materials.truckCabRightSide.texture!,
    materials.truckCabLeftSide.texture!,
    materials.truckCabTop.texture!,
    materials.truckCabRear.texture!,
    materials.truckCabRear.texture!,
    materials.truckCabFront.texture!,
  );

  const cab = new MoldableCubeGeometry(8, 3, 9, 3, 3, 5)
    .selectBy(vertex => vertex.y > 1 && (vertex.z < 3 && vertex.z > 0))
    .translate_(0, 2, 1.8)
    .selectBy(vertex => vertex.y > 1 && (vertex.z < 3 && vertex.z > 0))
    .translate_(0, 0, -1)
    .computeNormalsPerPlane()
    .done_();

  cab.setAttribute_(AttributeLocation.TextureDepth, new Float32Array(texturesPerSide), 1);

  const cabWindows = new MoldableCubeGeometry(8.1, 1.6, 2.4)
    .selectBy(vertex => vertex.z < 0 && vertex.y < 0)
    .translate_(0, 0, -2)
    .all_()
    .translate_(0, 2.3, 2.9)
    .merge(new MoldableCubeGeometry(7, 1.6, 2).translate_(0, 2.3, 3.55).done_())
    .done_();

  const bedFloor = new MoldableCubeGeometry(8, 1, 9).translate_(0, -1, 9).done_();

  function makeCoffinSide(swap = 1) {
    return new MoldableCubeGeometry(0.5, 2, 7.5, 1, 1, 2)
      .selectBy(vertex => vertex.z === 0)
      .translate_(1 * swap, 0, -1)
      .all_()
      .translate_(2 * swap, 0.4, 9)
      .done_();
  }

  function makeCoffinFrontBack(isSwap = false) {
    return new MoldableCubeGeometry(4, 2, 0.5)
      .selectBy(vertex => (isSwap ? -vertex.z : vertex.z) > 0)
      .scale_(1.12)
      .all_()
      .translate_(0, 0.4, isSwap ? 13 : 5)
      .done_();
  }

  function makeCoffingBottom() {
    return new MoldableCubeGeometry(4, 0.5, 7.5, 1, 1, 2)
      .selectBy(vertex => vertex.z === 0)
      .translate_(0, 0, -1)
      .scale_(1.5)
      .all_()
      .translate_(0, -0.2, 9)
      .done_();
  }

  const coffin = makeCoffinSide(-1)
    .merge(makeCoffinSide())
    .merge(makeCoffinFrontBack())
    .merge(makeCoffinFrontBack(true))
    .merge(makeCoffingBottom())
    .done_();

  const cabSideWindowMesh = new Mesh(cabWindows, new Material({ color: '#000' }));
  const cabMesh = new Mesh(cab, new Material({ color: '#fff' }));
  const bedFloorMesh = new Mesh(bedFloor, new Material({ color: truckColor }));
  const coffinMesh = new Mesh(coffin, materials.wood);

  const chassis = new Object3d(cabMesh, cabSideWindowMesh, bedFloorMesh, coffinMesh);
  chassis.position_.y += 2;
  chassis.position_.z += 3;
  chassis.scale_.z = 0.9;
  chassis.rotate_(0, Math.PI, 0);
  return chassis;
}

export class TruckObject3d extends Object3d {
  frontWheels: Object3d;
  rearWheels: Object3d;
  chassis: Object3d;
  wrapper: Object3d;

  constructor(frontWheels: Object3d, rearWheels: Object3d, chassis: Object3d) {
    super(new Object3d(frontWheels, rearWheels, chassis));
    this.wrapper = this.children_[0];
    this.frontWheels = frontWheels;
    this.rearWheels = rearWheels;
    this.chassis = chassis;
  }

  get leftFrontWheel() {
    return this.frontWheels.children_[0];
  }

  get rightFrontWheel() {
    return this.frontWheels.children_[1];
  }

  setSteeringAngle(steeringAngleRadians: number) {
    this.leftFrontWheel.setRotation_(0, steeringAngleRadians, 0);
    this.rightFrontWheel.setRotation_(0, steeringAngleRadians, 0);
  }

  private wheelRotation = 0;
  setDriveRotationRate(rate: number) {
    this.wheelRotation += rate;
    this.leftFrontWheel.children_[0].setRotation_(this.wheelRotation, 0, 0);
    this.rightFrontWheel.children_[0].setRotation_(this.wheelRotation, 0, 0);
    this.rearWheels.setRotation_(this.wheelRotation, 0, 0);
  }
}

export function makeTruck() {
  const frontWheels = createWheelPair();
  const rearWheels = createWheelPair();
  frontWheels.position_.z += 4.5;
  rearWheels.position_.z -= 5;
  const truckObject = new TruckObject3d(frontWheels, rearWheels, createChassis());
  truckObject.scale_.set(0.7, 0.7, 0.7);
  return truckObject;
}
