import { drawEngine } from './core/draw-engine';
import { menuState } from './game-states/menu.state';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';

createGameStateMachine(menuState);

window.onload = () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#c')!;
  drawEngine.initialize(canvas);
  update(0);
}

let previousTime = 0;
const maxFps = 60;
const interval = 1000 / maxFps;

function update(currentTime: number) {
  const delta = currentTime - previousTime;

  if (delta >= interval || !previousTime) {
    previousTime = currentTime - (delta % interval);

    drawEngine.context.clearRect(0, 0, drawEngine.width, drawEngine.height);
    gameStateMachine.getState().onUpdate(currentTime);
  }
  requestAnimationFrame(update);
}
