import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';

export function createHallway(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number, spacing: number) {
  const isHorizontal = width >= depth;
  const wallGeometry2 = new MoldableCubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    .translate_(isHorizontal ? 0 : spacing, 0, isHorizontal ? spacing : 0);

  return new MoldableCubeGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    .translate_(isHorizontal ? 0 : -spacing, 0, isHorizontal ? -spacing : 0)
    .merge(wallGeometry2)
    .computeNormals()
    .done_();
}

export function createBox(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number) {
  const spacing = (width - depth) / 2;
  const sideWidth = width - depth * 2;
  const segmentWidth = width / widthSegments;
  const widthInSegments = width / segmentWidth;
  const sideSpacing = (segmentWidth / 2) * (widthInSegments - 1);
  const verticalWalls = createHallway(sideWidth, height, segmentWidth, Math.ceil(widthSegments * (sideWidth / width)), heightSegments, depthSegments, sideSpacing).all_().rotate_(0, Math.PI / 2, 0).done_();
  return createHallway(width, height, depth, widthSegments, heightSegments, depthSegments, spacing).merge(verticalWalls).computeNormals();
}
