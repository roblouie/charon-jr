import { MoldableCubeGeometry } from "@/engine/moldable-cube-geometry";

export class PlaneGeometry extends MoldableCubeGeometry {

  constructor(width = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1, heightmap?: number[]) {
    super(width, 1, depth, subdivisionsWidth, 0, subdivisionsDepth, 1);

    if (heightmap) {
      this
        .modifyEachVertex((vertex, index) => {
          vertex.y = heightmap[index]
        })
        .computeNormalsPerPlane()
        .done();
    }
  }
}
