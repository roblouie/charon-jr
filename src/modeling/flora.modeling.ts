import { doTimes } from '@/engine/helpers';
import { noiseMaker } from '@/engine/noise-maker';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';


function makeTree(treeHeight: number, verticalSegments: number, radius: number, seed: number) {
  const segmentSize = treeHeight / verticalSegments;
  const largeTreeBase = new MoldableCubeGeometry(3, treeHeight, 3, 4, verticalSegments, 4)
    .cylindrify(radius)
    .translate(0, treeHeight / 2, 0);

  let scale = 1.0;
  doTimes(verticalSegments + 1, index => {
    const yPos = index * segmentSize;
    largeTreeBase.selectBy(vertex => vertex.y === yPos)
      .scale(scale, 1, scale);
    if (index % 2 === 0) {
      scale *= 0.7;
    } else {
      largeTreeBase.translate(noiseMaker.randomNumber(index + treeHeight + seed), 0, noiseMaker.randomNumber(index + treeHeight + seed));
    }

    if (index === verticalSegments) {
      largeTreeBase.scale(0, 1.2, 0);
    }
  });
  return largeTreeBase.done();
}


function makeLeavesGeo(
  fidelity: number,
  radius: number,
  noiseSeed: number,
  translateX: number,
  translateY: number,
  translateZ: number,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
) {
  return new MoldableCubeGeometry(fidelity, fidelity, fidelity, fidelity, fidelity, fidelity)
    .spherify(radius)
    .translate(translateX, translateY, translateZ)
    .scale(scaleX, scaleY, scaleZ)
    .noisify(noiseSeed, 0.05)
    .computeNormalsCrossPlane()
    .done();
}

// Large Tree
export function makeLargeTreeGeo() {
  const treeBase = makeTree(16, 8, 2, 0);
  const branch1 = makeTree(8, 4, 1, 0);
  const branch2 = makeTree(6, 3, 0.7, 0);
  branch1.all().rotate(0, 0, 1).translate(0, 5, -0.2).done();
  branch2.all().rotate(0.8, 0, -1).translate(0, 8, -0.2).done();

  return treeBase.merge(branch1).merge(branch2).computeNormalsCrossPlane().done();
}

export function makeTreeLeavesGeo() {
  const leavesGeo1 = makeLeavesGeo(3, 3, 2, -3, 8, -1, 2, 1, 1.7).done();
  const leavesGeo2 = makeLeavesGeo(3, 3, 5, 2.5, 10, 3, 2, 1, 1.8).done();
  const leavesGeo3 = makeLeavesGeo(3, 4, 7, 0, 9.3, 0, 2, 1.5, 1.9).done();

  return leavesGeo1.merge(leavesGeo2).merge(leavesGeo3).done();
}


// Plant 1
function makePlantLeaves(leafScaleX: number, leafScaleY: number, leafScaleZ: number) {
  return new MoldableCubeGeometry(2, 2, 1, 2, 1)
    .selectBy(vertex => vertex.y > 0 && vertex.x !== 0)
    .scale(leafScaleX, leafScaleY, leafScaleZ)
    .selectBy(vertex => vertex.y > 0 && vertex.x === 0)
    .translate(0, -2, 0)
    .done();
}

export function makePlantGeo() {
  const bush1Geo = makePlantLeaves(3, 3, 0);
  return bush1Geo.merge(makePlantLeaves(1, 3, 0).all().rotate(0, 0.8)).all().translate(0, 1).done();
}
