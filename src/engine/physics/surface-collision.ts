import { Face } from './face';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export const halfLevelSize = 1024;
export const maxHalfLevelValue = halfLevelSize - 1;
const cellSize = 64;

const cellsInOneDirection = 16;

export function getGridPosition(point: EnhancedDOMPoint) {
  return Math.floor((point.x + halfLevelSize) / cellSize) + (Math.floor((point.z + halfLevelSize) / cellSize) * cellsInOneDirection);
}

export function findFloorHeightAtPosition(floorFaces: Face[], position: EnhancedDOMPoint) {
  let height: number;

  for (const floor of floorFaces) {
    const { x: x1, z: z1 } = floor.points[0];
    const { x: x2, z: z2 } = floor.points[1];
    const { x: x3, z: z3 } = floor.points[2];

    if ((z1 - position.z) * (x2 - x1) - (x1 - position.x) * (z2 - z1) < 0) {
      continue;
    }

    if ((z2 - position.z) * (x3 - x2) - (x2 - position.x) * (z3 - z2) < 0) {
      continue;
    }

    if ((z3 - position.z) * (x1 - x3) - (x3 - position.x) * (z1 - z3) < 0) {
      continue;
    }

    height = -(position.x * floor.normal.x + floor.normal.z * position.z + floor.originOffset) / floor.normal.y;

    const buffer = -3; // original mario 64 code uses a 78 unit buffer, but mario is 160 units tall compared to our presently much smaller sizes
    if (position.y - (height + buffer) < 0) {
      continue;
    }

    return {
      height,
      floor,
    };
  }
}

export function rayCastCollision(walls: Face[], startPosition: EnhancedDOMPoint, endPosition: EnhancedDOMPoint) {
  for (const [index, wall] of walls.entries()) {
    const collision = lineIntersectsTriangle(startPosition, endPosition, wall.points[0], wall.points[1], wall.points[2]);
    if (collision) {
      return { index, collision, wall };
    }
  }
}


function lineIntersectsTriangle(q1: EnhancedDOMPoint, q2: EnhancedDOMPoint, p1: EnhancedDOMPoint, p2: EnhancedDOMPoint, p3: EnhancedDOMPoint) {
  const s1 = getSignedTetraVolume(q1, p1, p2, p3);
  const s2 = getSignedTetraVolume(q2, p1, p2, p3);

  if (s1 === s2) {
    return null;
  }

  const s3 = getSignedTetraVolume(q1, q2, p1, p2);
  const s4 = getSignedTetraVolume(q1, q2, p2, p3);
  const s5 = getSignedTetraVolume(q1, q2, p3, p1);

  if (s3 === s4 && s4 === s5) {
    const p2MinusP1 = new EnhancedDOMPoint().subtractVectors(p2, p1);
    const p3MinusP1 = new EnhancedDOMPoint().subtractVectors(p3, p1);
    const n = new EnhancedDOMPoint().crossVectors(p2MinusP1, p3MinusP1);

    //const nMinusP1 = subtractVectors(n, p1);
    const q2MinusQ1 = new EnhancedDOMPoint().subtractVectors(q2, q1);
    const p1MinusQ1 = new EnhancedDOMPoint().subtractVectors(p1, q1);
    const t = p1MinusQ1.dot(n) / q2MinusQ1.dot(n);

    const scaled = q2MinusQ1.scale(t);
    return q1.add(scaled);
  }
}

function getSignedTetraVolume(a: DOMPoint, b: DOMPoint, c: DOMPoint, d: DOMPoint) {
  const dMinusA = new EnhancedDOMPoint().subtractVectors(d, a);
  const cMinusA = new EnhancedDOMPoint().subtractVectors(c, a);
  const bMinusA = new EnhancedDOMPoint().subtractVectors(b, a);
  const crossBACA = new EnhancedDOMPoint().crossVectors(bMinusA, cMinusA);
  const dot = crossBACA.dot(dMinusA);
  return Math.sign(dot / 6.0);
}


export function findWallCollisionsFromList(walls: Face[], position: EnhancedDOMPoint, offsetY: number, radius: number) {
  const collisionData = {
    xPush: 0,
    zPush: 0,
    walls: [] as Face[],
    numberOfWallsHit: 0,
  };

  const { x, z } = position;
  const y = position.y + offsetY;

  for (const wall of walls) {
    if (y < wall.lowerY || y > wall.upperY) {
      continue;
    }

    const offset = wall.normal.dot(position) + wall.originOffset;
    if (offset < -radius || offset > radius) {
      continue;
    }

    const isXProjection = wall.normal.x < -0.707 || wall.normal.x > 0.707;
    const w = isXProjection ? -z : x;
    const wNormal = isXProjection ? wall.normal.x : wall.normal.z;

    let w1 = -wall.points[0].z;
    let w2 = -wall.points[1].z;
    let w3 = -wall.points[2].z;

    if (!isXProjection) {
      w1 = wall.points[0].x;
      w2 = wall.points[1].x;
      w3 = wall.points[2].x;
    }
    let y1 = wall.points[0].y;
    let y2 = wall.points[1].y;
    let y3 = wall.points[2].y;

    const invertSign = wNormal > 0 ? 1 : -1;

    if (((y1 - y) * (w2 - w1) - (w1 - w) * (y2 - y1)) * invertSign > 0) {
      continue;
    }
    if (((y2 - y) * (w3 - w2) - (w2 - w) * (y3 - y2)) * invertSign > 0) {
      continue;
    }
    if (((y3 - y) * (w1 - w3) - (w3 - w) * (y1 - y3)) * invertSign > 0) {
      continue;
    }

    collisionData.xPush += wall.normal.x * (radius - offset);
    collisionData.zPush += wall.normal.z * (radius - offset);
    collisionData.walls.push(wall);
    collisionData.numberOfWallsHit++;
  }
  return collisionData;
}
