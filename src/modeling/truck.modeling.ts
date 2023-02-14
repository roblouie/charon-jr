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
    .allMc()
    .rotateMc(0, 0, Math.PI / 2)
    .computeNormalsCrossPlane()
    .doneMc();
}

function createWheel() {
  return new MoldableCubeGeometry(2, 2, 2, 4, 1, 4)
    .selectBy(vertex => Math.abs(vertex.x) > 0.4 && Math.abs(vertex.z) > 0.4)
    .cylindrify(1.5)
    .invertSelection()
    .scaleMc(1, 0.5, 1)
    .allMc()
    .rotateMc(0, 0, Math.PI / 2)
    .computeNormalsPerPlane()
    .doneMc();
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
  wheelAndTire.scaleO3d.set(1.1, 0.6, 0.6);
  return wheelAndTire;
}

function createWheelPair() {
  const leftWheel = createWheelAndTire();
  leftWheel.positionO3d.x -= 4.5;

  const rightWheel = createWheelAndTire();
  rightWheel.positionO3d.x += 4.5;

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
    .translateMc(0, 2, 1.8)
    .selectBy(vertex => vertex.y > 1 && (vertex.z < 3 && vertex.z > 0))
    .translateMc(0, 0, -1)
    .computeNormalsPerPlane()
    .doneMc();

  cab.setAttributeMc(AttributeLocation.TextureDepth, new Float32Array(texturesPerSide), 1);

  const cabWindows = new MoldableCubeGeometry(8.1, 1.6, 2.4)
    .selectBy(vertex => vertex.z < 0 && vertex.y < 0)
    .translateMc(0, 0, -2)
    .allMc()
    .translateMc(0, 2.3, 2.9)
    .merge(new MoldableCubeGeometry(7, 1.6, 2).translateMc(0, 2.3, 3.55).doneMc())
    .doneMc();

  const bedFloor = new MoldableCubeGeometry(8, 1, 9).translateMc(0, -1, 9).doneMc();

  function makeCoffinSide(swap = 1) {
    return new MoldableCubeGeometry(0.5, 2, 7.5, 1, 1, 2)
      .selectBy(vertex => vertex.z === 0)
      .translateMc(1 * swap, 0, -1)
      .allMc()
      .translateMc(2 * swap, 0.4, 9)
      .doneMc();
  }

  function makeCoffinFrontBack(isSwap = false) {
    return new MoldableCubeGeometry(4, 2, 0.5)
      .selectBy(vertex => (isSwap ? -vertex.z : vertex.z) > 0)
      .scaleMc(1.12)
      .allMc()
      .translateMc(0, 0.4, isSwap ? 13 : 5)
      .doneMc();
  }

  function makeCoffingBottom() {
    return new MoldableCubeGeometry(4, 0.5, 7.5, 1, 1, 2)
      .selectBy(vertex => vertex.z === 0)
      .translateMc(0, 0, -1)
      .scaleMc(1.5)
      .allMc()
      .translateMc(0, -0.2, 9)
      .doneMc();
  }

  const coffin = makeCoffinSide(-1)
    .merge(makeCoffinSide())
    .merge(makeCoffinFrontBack())
    .merge(makeCoffinFrontBack(true))
    .merge(makeCoffingBottom())
    .doneMc();

  const cabSideWindowMesh = new Mesh(cabWindows, new Material({ color: '#000' }));
  const cabMesh = new Mesh(cab, new Material({ color: '#fff' }));
  const bedFloorMesh = new Mesh(bedFloor, new Material({ color: truckColor }));
  const coffinMesh = new Mesh(coffin, materials.wood);

  const chassis = new Object3d(cabMesh, cabSideWindowMesh, bedFloorMesh, coffinMesh);
  chassis.positionO3d.y += 2;
  chassis.positionO3d.z += 3;
  chassis.scaleO3d.z = 0.9;
  chassis.rotateO3d(0, Math.PI, 0);
  return chassis;
}

export class TruckObject3d extends Object3d {
  frontWheels: Object3d;
  rearWheels: Object3d;
  chassis: Object3d;
  wrapper: Object3d

  constructor(frontWheels: Object3d, rearWheels: Object3d, chassis: Object3d) {
    super(new Object3d(frontWheels, rearWheels, chassis));
    this.wrapper = this.childrenO3d[0];
    this.frontWheels = frontWheels;
    this.rearWheels = rearWheels;
    this.chassis = chassis;
  }

  get leftFrontWheel() {
    return this.frontWheels.childrenO3d[0];
  }

  get rightFrontWheel() {
    return this.frontWheels.childrenO3d[1];
  }

  setSteeringAngle(steeringAngleRadians: number) {
    this.leftFrontWheel.setRotationO3d(0, steeringAngleRadians, 0);
    this.rightFrontWheel.setRotationO3d(0, steeringAngleRadians, 0);
  }

  private wheelRotation = 0;
  setDriveRotationRate(rate: number) {
    this.wheelRotation += rate;
    this.leftFrontWheel.childrenO3d[0].setRotationO3d(this.wheelRotation, 0, 0);
    this.rightFrontWheel.childrenO3d[0].setRotationO3d(this.wheelRotation, 0, 0);
    this.rearWheels.setRotationO3d(this.wheelRotation, 0, 0);
  }
}

export function makeTruck() {
  const frontWheels = createWheelPair();
  const rearWheels = createWheelPair();
  frontWheels.positionO3d.z += 4.5;
  rearWheels.positionO3d.z -= 5;
  const truckObject = new TruckObject3d(frontWheels, rearWheels, createChassis());
  truckObject.scaleO3d.set(0.7, 0.7, 0.7);
  return truckObject;
}
