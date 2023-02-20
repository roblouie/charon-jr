import { coinAudio } from '@/sound-effects';
import { text } from '@/engine/svg-maker/base';
import { overlaySvg } from '@/draw-helpers';

class Hud {
  #timeRemaining = 0;
  #score = 0;
  currentScoreBonus = 0;
  isScoreBonusActive = false;
  scoreBonusTimer = 0;
  private scoreBonusPer = 1;

  currentTimeBonus = 0;
  isTimeBonusActive = false;
  timeBonusTimer = 0;
  timeBonusRotator = 0;

  clear() {
    t.innerHTML = '';
  }

  set score(newScore: number) {
    this.#score = newScore;
    sc.innerHTML = '$' + this.#score;
  }

  get score() {
    return this.#score;
  }

  set timeRemaining(newTime: number) {
    this.#timeRemaining = newTime;
    ti.innerHTML = this.#timeRemaining.toFixed(1);
  }

  get timeRemaining() {
    return this.#timeRemaining;
  }

  reset() {
    t.innerHTML = overlaySvg({},
      text({id_: 'ti', x: 120, y: 100}),
      text({id_: 'tiB', x: 120, y: 200}),
      text({id_: 'sc', x: 1700, y: 100}),
      text({id_: 'scB', x: 1700, y: 200})
    );

    this.#timeRemaining = 100;
    this.score = 0;
    this.currentScoreBonus = 0;
    this.isScoreBonusActive = false;
    this.scoreBonusTimer = 0;
    this.currentTimeBonus = 0;
    this.isTimeBonusActive = false;
  }

  setTimeBonus(timeBonus: number) {
    this.timeBonusTimer = 3;
    this.isTimeBonusActive = true;
    this.currentTimeBonus = timeBonus;
    this.timeRemaining += timeBonus;
    this.timeBonusRotator = Math.PI;
  }

  addToScoreBonus() {
    this.isScoreBonusActive = true;
    this.currentScoreBonus += this.scoreBonusPer;

    this.scoreBonusPer++;
    this.scoreBonusTimer = 1;
    const coinSound = coinAudio()
    coinSound.playbackRate.value = Math.min(0.8 + this.scoreBonusPer / 15, 1.5);
    coinSound.start();
  }

  draw() {
    this.timeRemaining -= 0.0166;

    if (this.isTimeBonusActive) {
      // TODO: Sping hourglass in svg
      // draw2d.context.rotate(Math.max(this.timeBonusRotator -= 0.1, 0));
    }

    // TODO: Draw hourglass in svg
    // draw2d.drawText('⏳', 'monospace', 50, 0, 0, 1, 'center', false);
    // draw2d.context.restore();

    if (this.isTimeBonusActive) {
      this.timeBonusTimer -= 0.0166;
      tiB.innerHTML = '+' + this.currentTimeBonus.toFixed(0);
      if (this.timeBonusTimer <= 0) {
        this.isTimeBonusActive = false;
        tiB.innerHTML = '';
      }
    }

    if (this.isScoreBonusActive) {
      this.scoreBonusTimer -= 0.0166;

      scB.innerHTML = '+$' + this.currentScoreBonus;

      if (this.scoreBonusTimer <= 0) {
        this.score += this.currentScoreBonus;
        this.currentScoreBonus = 0;
        this.isScoreBonusActive = false;
        this.scoreBonusPer = 1;
        scB.innerHTML = '';
      }
    }
  }
}

export const hud = new Hud();
