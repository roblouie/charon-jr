import { State } from '@/engine/state-machine/state';
import { gameStateMachine } from '@/game-states/game-state-machine';
import { gameStates } from '@/index';
import { getRankFromScore } from '@/engine/helpers';
import { rect, text } from '@/engine/svg-maker/base';
import { createColumn, overlaySvg } from '@/draw-helpers';

export class LevelOverState implements State {
  onEnter(spiritsTransported: number, payment: number, levelNumber: number) {
    const score = spiritsTransported * payment;
    const nextLeftRow = createColumn(320, 300, 100);
    const nextRightRow = createColumn(1300, 300, 100);
    const nextCenterRow = createColumn(640, 160, 120);

    tmpl.innerHTML = overlaySvg({},
      rect({ fill: '#0008' }),
      ...['TIME UP', 'RANK', getRankFromScore(score)].map((columnText, i) => text(nextCenterRow(i === 1 ? 420 : 0), columnText)),
      ...['SPIRITS TRANSPORTED', 'PAYMENT COLLECTED', 'TOTAL SCORE'].map(columnText => text(nextLeftRow(), columnText)),
      ...[spiritsTransported, payment, score].map(columnText => text(nextRightRow(), columnText)),
    );
    const pastScore = localStorage.getItem(`ddamt_score-${levelNumber}`);
    if (!pastScore || score > parseInt(pastScore)) {
      localStorage.setItem(`ddamt_score-${levelNumber}`, score.toString());
    }
    setTimeout(() => {
      gameStateMachine.setState(gameStates.menuState);
    }, 5000);
  }

  onUpdate() {}

  onLeave() {
    tmpl.innerHTML = '';
  }
}
