import { Scene } from '@/engine/renderer/scene';
import { State } from '@/core/state';
import { Skybox } from '@/skybox';
import { drawEarthSky, drawSkyPurple, materials, underworldSky } from '@/texture-maker';
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { renderer } from '@/engine/renderer/renderer';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { gameState } from '@/game-states/game-state';
import { truck } from '@/modeling/truck.modeling';
import { draw2dEngine } from '@/core/draw2d-engine';
import { Mesh } from '@/engine/renderer/mesh';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { Texture } from '@/engine/renderer/texture';
import { Material } from '@/engine/renderer/material';

class MenuState implements State {
  scene: Scene;
  camera: Camera;

  constructor() {
    this.scene = new Scene();
    this.camera = new Camera(Math.PI / 4, 16 / 9, 1, 400);
  }

  onEnter() {
    this.camera.position = new EnhancedDOMPoint(0, 10, 20);
    truck.position.set(0, 0, 0);
    this.camera.lookAt(truck.position);
    this.camera.position.x += 8;
    this.camera.position.y += 2;
    this.camera.updateWorldMatrix();
    this.scene = new Scene();
    this.scene.skybox = new Skybox(...underworldSky);
    this.scene.skybox.bindGeometry();
    this.scene.add(truck);
  }

  onUpdate() {
    truck.rotate(0, -0.01, 0);
    truck.setDriveRotationRate(0.1);
    truck.setSteeringAngle(-0.3);
    this.scene.updateWorldMatrix();

    renderer.render(this.camera, this.scene);

    draw2dEngine.drawText('DEATH DRIVES', 'Times New Roman', 80, 640, 80, 1);
    draw2dEngine.drawText('A MONSTER TRUCK', 'Times New Roman', 60, 640, 140, 1);

    if (controls.isEnter) {
      draw2dEngine.context.fillStyle = '#111a';
      draw2dEngine.context.fillRect(0, 0, 1920, 1080);
      draw2dEngine.drawText('Loading...', 'Times New Roman', 80, 640, 360, 1);
      setTimeout(() => {
        getGameStateMachine().setState(gameState, 0);
      });
    }
  }

  onLeave() {
    truck.setRotation(0, 0, 0);
  }
}

export const menuState = new MenuState();
