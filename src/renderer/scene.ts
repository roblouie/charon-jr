import { Object3d } from '@/renderer/object-3d';
import { Skybox } from '@/skybox';
import { Mesh } from '@/renderer/mesh';

export class Scene extends Object3d {
  skybox?: Skybox;
  solidMeshes: Mesh[] = [];
  transparentMeshes: Mesh[] = [];

  add(...object3ds: Object3d[]) {
    super.add(...object3ds);
    object3ds.forEach(object3d => {
      if (object3d.isMesh()) {
        object3d.geometry.bindGeometry();
        object3d.allChildren().forEach(child => child.isMesh() && child.geometry.bindGeometry())
        object3d.material.isTransparent ? this.transparentMeshes.push(object3d) : this.solidMeshes.push(object3d);
      }
    })
  }

  remove(object3d: Object3d) {
    super.remove(object3d);
    if (object3d.isMesh()) {
      if (object3d.material.isTransparent) {
        this.transparentMeshes = this.transparentMeshes.filter(mesh => mesh !== object3d);
      } else {
        this.solidMeshes = this.solidMeshes.filter(mesh => mesh !== object3d);
      }
    }
  }
}
