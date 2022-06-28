import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';

class GameState implements State {
  image = new Image();
  ballSize = 100;
  ballPosition = new DOMPoint(100, 100);
  ballVelocity = new DOMPoint(10, 10);

  constructor() {
    this.image.src = 'ball.png'; // all assets will end up flat in the final zip to save space, so no path on any asset
  }

  // Make sure ball starts at the same spot when game is entered
  onEnter() {
    this.ballPosition = new DOMPoint(100, 100);
    this.ballVelocity = new DOMPoint(10, 10);
  }

  onUpdate() {
    this.ballPosition.x += this.ballVelocity.x;
    this.ballPosition.y += this.ballVelocity.y

    if (this.ballPosition.x + this.ballSize > drawEngine.width || this.ballPosition.x <= 0) {
      this.ballVelocity.x *= -1;
    }

    if (this.ballPosition.y + this.ballSize > drawEngine.height || this.ballPosition.y <= 0) {
      this.ballVelocity.y *= -1;
    }

    drawEngine.context.fillStyle = 'blue';
    drawEngine.context.fillRect(0, 0, drawEngine.width, drawEngine.height);
    drawEngine.context.drawImage(this.image, this.ballPosition.x, this.ballPosition.y, this.ballSize, this.ballSize);



    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }
  }
}

export const gameState = new GameState();
