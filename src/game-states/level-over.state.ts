import { State } from '@/engine/state-machine/state';
import { gameStateMachine } from '@/game-states/game-state-machine';
import { draw2d } from '@/engine/draw-2d';
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
    const pastScore = localStorage.getItem(`ddamt_score-${levelNumber}`);
    if (!pastScore || this.score > parseInt(pastScore)) {
      localStorage.setItem(`ddamt_score-${levelNumber}`, this.score.toString());
    }
    setTimeout(() => {
      gameStateMachine.setState(gameStates.menuState);
    }, 4000);
  }

  onUpdate() {
    draw2d.clear();
    draw2d.context.fillStyle = 'black';
    draw2d.context.fillRect(0, 80, 1280, 140);
    draw2d.context.fillStyle = '#0008';
    draw2d.context.fillRect(0, 0, 1280, 720);

    draw2d.drawText('TIME UP','Times New Roman', 80, 640, 160);

    draw2d.drawText('SPIRITS TRANSPORTED','monospace', 30,320, 300, 1, 'left');
    draw2d.drawText(this.spiritsTransported.toString(), 'monospace', 30, 960, 300, 1, 'right');
    draw2d.drawText('PAYMENT COLLECTED', 'monospace', 30, 320, 350, 1, 'left');
    draw2d.drawText(this.payment.toString(), 'monospace', 30, 960, 350,  1, 'right');

    draw2d.drawText('TOTAL SCORE', 'monospace', 30, 320, 400, 1, 'left');
    draw2d.drawText(this.score.toString(), 'monospace', 30, 960, 400,  1, 'right');

    draw2d.drawText('RANK', 'monospace', 30, 640, 500);
    draw2d.drawText(this.rank, 'Times New Roman', 120, 640, 620);
  }

  onLeave() {
    draw2d.clear();
  }
}
