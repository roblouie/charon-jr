import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { debounce } from '@/core/timing-helpers';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';

class MenuState implements State {
  private isStartSelected = true;

  onUpdate() {
    const xCenter = drawEngine.context.canvas.width / 2
    drawEngine.drawText('Menu', 30, xCenter, 50);
    drawEngine.drawText('Start Game', 30, xCenter, 500, this.isStartSelected ? 'white' : 'gray');
    drawEngine.drawText('Toggle Fullscreen', 30, xCenter, 550, this.isStartSelected ? 'gray' : 'white');
    this.updateControls();
  }

  updateControls() {
    if (controls.isUp || controls.isDown) {
      debounce(() => this.isStartSelected = !this.isStartSelected, 20);
    }

    if (controls.isEnter) {
      if (this.isStartSelected) {
        gameStateMachine.setState(gameState);
      } else {
        debounce(() => this.toggleFullscreen(), 20);
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

export const menuState = new MenuState();
