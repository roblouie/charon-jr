import { Scene } from '@/engine/renderer/scene';
import { State } from '@/core/state';
import { Skybox } from '@/skybox';
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { renderer } from '@/engine/renderer/renderer';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { draw2dEngine } from '@/core/draw2d-engine';
import { makeTruck, TruckObject3d } from '@/modeling/truck.modeling';
import { gameStates } from '@/index';
import { createSkybox, drawSkyPurple, materials } from '@/texture-maker';
import { debounce } from '@/core/timing-helpers';
import { clamp, getRankFromScore } from '@/engine/helpers';
import { Mesh } from '@/engine/renderer/mesh';
import { ghostThankYouAudio } from '@/engine/audio/audio-player';
import { makeTombstoneGeo } from '@/modeling/stone.modeling';

export class MenuState implements State {
  scene?: Scene;
  camera: Camera;
  truck: TruckObject3d;
  tombstone: Mesh;
  private selectedOption = 0;

  constructor() {
    this.camera = new Camera(Math.PI / 6, 16 / 9, 1, 400);
    this.truck = makeTruck();
    this.truck.scale.set(0.4, 0.4, 0.4);

    this.tombstone = new Mesh(makeTombstoneGeo(15, 10, 5, 9,18), materials.underworldRocks);
    this.tombstone.position.set(4.6, -1.5, -27.0);
    this.tombstone.setRotation(0.1, -0.6, 0);
  }

  onEnter() {
    this.scene = new Scene();
    this.truck.position.set(-6, -1, -23);
    this.truck.setRotation(0.3, 0, 0);
    this.scene = new Scene();
    this.scene.skybox = new Skybox(...createSkybox(drawSkyPurple));
    this.scene.skybox.bindGeometry();
    this.scene.add(this.truck, this.tombstone);
    draw2dEngine.context.canvas.style.transform = 'translate3d(13%, 5%, -27px) rotate3d(0, 1, 0, 337deg)'
  }

  private getScore(levelNumber: number) {
    return parseInt(window.localStorage.getItem(`ddamt_score-${levelNumber}`) ?? '0')
  }

  onUpdate() {
    this.truck.wrapper.rotate(0, -0.01, 0);
    this.truck.setDriveRotationRate(0.1);
    this.truck.setSteeringAngle(-0.3);
    this.scene!.updateWorldMatrix();

    renderer.render(this.camera, this.scene!);

    draw2dEngine.clear();

    draw2dEngine.drawText('CHARON JR.', 'Times New Roman', 100, 640, 150);

    const level1Score = this.getScore(2);
    this.drawEngraving('UNDERWORLD', 55, 640, 270, this.selectedOption === 0 ? 1 : 0);
    this.drawEngraving(`Top Score ${level1Score} - RANK: ${getRankFromScore(level1Score)}`, 30, 640, 307,this.selectedOption === 0 ? 1 : 0);

    const level2Score = this.getScore(1);
    this.drawEngraving('PURGATORY', 55, 640, 385, this.selectedOption === 1 ? 1 : 0);
    this.drawEngraving(`Top Score ${level2Score} - RANK: ${getRankFromScore(level2Score)}`, 30, 640, 422,this.selectedOption === 1 ? 1 : 0);

    const level3Score = this.getScore(0);
    this.drawEngraving('EARTH', 55, 640, 500, this.selectedOption === 2 ? 1 : 0);
    this.drawEngraving(`Top Score ${level3Score} - RANK: ${getRankFromScore(level3Score)}`, 30, 640, 537,this.selectedOption === 2 ? 1 : 0);

    this.drawEngraving('FULLSCREEN', 40, 640, 610, this.selectedOption === 3 ? 1 : 0);

    if (controls.isDown || controls.direction.y > 0) {
      debounce(() => this.selectedOption++, 30);
    }

    if (controls.isUp || controls.direction.y < 0) {
      debounce(() => this.selectedOption--, 30);
    }

    this.selectedOption = clamp(this.selectedOption, 0, 3);

    if (controls.isEnter) {
      if (this.selectedOption < 3) {
        draw2dEngine.context.canvas.style.transform = '';
        draw2dEngine.context.fillStyle = 'black';
        draw2dEngine.context.fillRect(0, 0, 1920, 1080);
        draw2dEngine.drawText('Loading...', 'Times New Roman', 80, 640, 360);
        ghostThankYouAudio().start();
        setTimeout(() => {
          getGameStateMachine().setState(gameStates.gameState, 2 - this.selectedOption);
        });
      } else {
        debounce(() => this.toggleFullScreen(), 30);
      }
    }
  }

  drawEngraving(text: string, size: number, x: number, y: number, lineWidth = 0) {
    draw2dEngine.drawText(text, 'Times New Roman', size, x - 1, y - 1, 0, 'center', true, '#000');
    draw2dEngine.drawText(text, 'Times New Roman', size, x, y, lineWidth, 'center', true, 'rgba(45,48,61,0.73)');
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onLeave() {
    this.scene = undefined;
  }
}
