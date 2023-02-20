import { Scene } from '@/engine/renderer/scene';
import { State } from '@/engine/state-machine/state';
import { Skybox } from '@/engine/skybox';
import { Camera } from '@/engine/renderer/camera';
import { render } from '@/engine/renderer/renderer';
import { controls } from '@/controls';
import { gameStateMachine } from '@/game-states/game-state-machine';
import { makeTruck, TruckObject3d } from '@/modeling/truck.modeling';
import { gameStates } from '@/index';
import { materials, skyboxes } from '@/texture-maker';
import { clamp, getRankFromScore } from '@/engine/helpers';
import { Mesh } from '@/engine/renderer/mesh';
import { makeTombstoneGeo } from '@/modeling/stone.modeling';
import { ghostThankYouAudio, landingAudio } from '@/sound-effects';
import { rect, text } from '@/engine/svg-maker/base';
import { overlaySvg, createColumn } from '@/draw-helpers';

export class MenuState implements State {
  scene?: Scene;
  camera: Camera;
  truck: TruckObject3d;
  tombstone: Mesh;
  private selectedOption = 0;

  constructor() {
    this.camera = new Camera(Math.PI / 6, 16 / 9, 1, 400);
    this.truck = makeTruck();
    this.truck.scale_.set(0.4, 0.4, 0.4);

    this.tombstone = new Mesh(makeTombstoneGeo(15, 10, 5, 9,18), materials.underworldRocks);
    this.tombstone.position_.set(4.6, -1.5, -27.0);
    this.tombstone.setRotation_(0.1, -0.6, 0);
  }

  onEnter() {
    this.scene = new Scene();
    this.truck.position_.set(-6, -1, -23);
    this.truck.setRotation_(0.3, 0, 0);
    this.scene = new Scene();
    this.scene.skybox = new Skybox(...skyboxes.underworldSky);
    this.scene.skybox.bindGeometry();
    this.scene.add_(this.truck, this.tombstone);

    const nextRow = createColumn('50%', 180, 60);

    const scoreDisplay = (levelNumber: number) => `Top Score ${this.getScore(levelNumber)} - RANK: ${getRankFromScore(this.getScore(levelNumber))}`;

    const smallFont = () => ({ ...nextRow(), style: 'font-size: 40px' });
    t.style.transform = 'translate3d(13%, 5%, 0) rotate3d(0, 1, 0, 337deg)';
    t.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
      text({ ...nextRow(0), style: 'font-size: 140px' }, 'CHARON JR.'),
      text(nextRow(100), 'Underworld'),
      text(smallFont(), scoreDisplay(2)),
      text(nextRow(50), 'Purgatory'),
      text(smallFont(), scoreDisplay(1)),
      text(nextRow(50), 'Earth'),
      text(smallFont(), scoreDisplay(0)),
      text(nextRow(80), 'Fullscreen'),
    );
  }

  private getScore(levelNumber: number) {
    return parseInt(localStorage.getItem(`ddamt_score-${levelNumber}`) ?? '0')
  }

  onUpdate() {
    const onChange = (direction: number) => {
      landingAudio().start();
      this.selectedOption += direction;
    }

    if (controls.isDown && !controls.previousState.isDown) {
      onChange(1);
    }

    if (controls.isUp && !controls.previousState.isUp) {
      onChange(-1);
    }

    this.truck.wrapper.rotate_(0, -0.01, 0);
    this.truck.setDriveRotationRate(0.1);
    this.truck.setSteeringAngle(-0.3);
    this.scene!.updateWorldMatrix();

    render(this.camera, this.scene!);

    this.selectedOption = clamp(this.selectedOption, 0, 3);

    if (controls.isSelect && !controls.previousState.isSelect) {
      if (this.selectedOption < 3) {
        t.style.transform = '';
        t.innerHTML = overlaySvg({ style: 'text-anchor: middle' },
          rect({x: 0, y: 0, width: '100%', height: '100%' }),
          text({ x: '50%', y: '50%', style: 'font-size: 140px' }, 'Loading...')
        );
        ghostThankYouAudio().start();
        setTimeout(() => {
          gameStateMachine.setState(gameStates.gameState, 2 - this.selectedOption);
        });
      } else {
        this.toggleFullScreen();
      }
    }
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
