import { State } from '@/core/state';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { draw2dEngine } from '@/core/draw2d-engine';
import { gameStates } from '@/index';
import { getRankFromScore } from '@/engine/helpers';

export class LevelOverState implements State {
  spiritsTransported = 0;
  payment = 0;
  score = 0;
  rank = 'F';

  onEnter(spiritsTransported: number, payment: number, levelNumber: number) {
    this.spiritsTransported = spiritsTransported;
    this.payment = payment;
    this.score = this.payment * this.spiritsTransported;
    this.rank = getRankFromScore(this.score)
    const pastScore = window.localStorage.getItem(`ddamt_score-${levelNumber}`);
    if (!pastScore || this.score > parseInt(pastScore)) {
      window.localStorage.setItem(`ddamt_score-${levelNumber}`, this.score.toString()); //s
    }
    setTimeout(() => {
      getGameStateMachine().setState(gameStates.menuState);
    }, 5000);
  }

  onUpdate() {
    draw2dEngine.clear();
    draw2dEngine.context.fillStyle = 'black';
    draw2dEngine.context.fillRect(0, 80, 1280, 140);
    draw2dEngine.context.fillStyle = '#0008';
    draw2dEngine.context.fillRect(0, 0, 1280, 720);

    draw2dEngine.drawText('TIME UP','Times New Roman', 80, 640, 170, 1);

    draw2dEngine.drawText('SPIRITS TRANSPORTED','monospace', 30,320, 300, 1, 'left');
    draw2dEngine.drawText(this.spiritsTransported.toString(), 'monospace', 30, 960, 300, 1, 'right');
    draw2dEngine.drawText('PAYMENT COLLECTED', 'monospace', 30, 320, 350, 1, 'left');
    draw2dEngine.drawText(this.payment.toString(), 'monospace', 30, 960, 350,  1, 'right');

    draw2dEngine.drawText('TOTAL SCORE', 'monospace', 30, 320, 400, 1, 'left');
    draw2dEngine.drawText(this.score.toString(), 'monospace', 30, 960, 400,  1, 'right');

    draw2dEngine.drawText('RANK', 'monospace', 30, 640, 500, 1);
    draw2dEngine.drawText(this.rank, 'Times New Roman', 120, 640, 620, 1);
  }

  onLeave() {
    draw2dEngine.clear();
  }
}
