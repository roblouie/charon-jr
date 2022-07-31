import { Scene } from '@/engine/renderer/scene';
import { State } from '@/core/state';
import { Skybox } from '@/skybox';
import { materials, skyboxes } from '@/texture-maker';
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { renderer } from '@/engine/renderer/renderer';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { gameState } from '@/game-states/game-state';

class MenuState implements State {
  scene: Scene;
  camera: Camera;

  constructor() {
    this.scene = new Scene();
    this.camera = new Camera(Math.PI / 5, 16 / 9, 1, 400);
  }

  onEnter() {
    const skybox = new Skybox(materials.marble.texture!.source,
      materials.marble.texture!.source,
      materials.marble.texture!.source,
      materials.marble.texture!.source,
      materials.marble.texture!.source,
      materials.marble.texture!.source,
    );
    skybox.bindGeometry();
    this.scene.skybox = skybox;
    this.camera.position = new EnhancedDOMPoint(0, 0, -17);
  }

  onUpdate() {
    this.scene.updateWorldMatrix();

    renderer.render(this.camera, this.scene);

    if (controls.isEnter) {
      getGameStateMachine().setState(gameState);
    }
  }
}

export const menuState = new MenuState();
