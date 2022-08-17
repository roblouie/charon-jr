import { Face } from './face';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export const halfLevelSize = 1024;
export const maxHalfLevelValue = halfLevelSize - 1;
const cellSize = 128;

const cellsInOneDirection = 8;

export function getGridPosition(point: EnhancedDOMPoint) {
  return Math.floor((point.x + halfLevelSize) / cellSize) + (Math.floor((point.z + halfLevelSize) / cellSize) * cellsInOneDirection);
}

// TODO: Make this return multiple floors and sort by height. Currently
// this requires floor faces to be sent in from highest to lowest, which with angles
// won't always be possible in a good way
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

    const buffer = -1; // original mario 64 code uses a 78 unit buffer, but mario is 160 units tall compared to our presently much smaller sizes
    if (position.y - (height + buffer) < 0) {
      continue;
    }

    return {
      height,
      floor,
    };
  }
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
