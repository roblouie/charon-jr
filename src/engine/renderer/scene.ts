import { Object3d } from '@/engine/renderer/object-3d';
import { Skybox } from '@/engine/skybox';
import { Mesh } from '@/engine/renderer/mesh';

export class Scene extends Object3d {
  skybox?: Skybox;
  solidMeshes: Mesh[] = [];
  transparentMeshes: Mesh[] = [];

  add(...object3ds: Object3d[]) {
    super.add(...object3ds);
    const flatWithChildren = [...object3ds, ...object3ds.flatMap(object3d => object3d.allChildren())];
    flatWithChildren.forEach(object3d => {
      // @ts-ignore
      if (object3d.geometry) {
        // @ts-ignore
        object3d.geometry.bindGeometry();
        // @ts-ignore
        object3d.material.isTransparent ? this.transparentMeshes.push(object3d) : this.solidMeshes.push(object3d);
      }
    })
  }

  removeO3d(object3d: Object3d) {
    super.removeO3d(object3d);
    [object3d, ...object3d.allChildren()]
      .forEach(obj => {
      // @ts-ignore
      if (obj.geometry) {
        // @ts-ignore
        if (obj.material.isTransparent) {
          this.transparentMeshes = this.transparentMeshes.filter(mesh => mesh !== obj);
        } else {
          this.solidMeshes = this.solidMeshes.filter(mesh => mesh !== obj);
        }
      }
    });
  }
}
