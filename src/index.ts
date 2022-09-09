import {populateMaterials } from '@/texture-maker';
import { controls } from '@/core/controls';
import { createGameStateMachine, getGameStateMachine } from '@/game-state-machine';
import { GameState } from '@/game-states/game-state';
import { MenuState } from '@/game-states/menu-state';
import { LevelOverState } from '@/game-states/level-over-state';
import { State } from '@/core/state';

export const gameStates = {
  gameState: {} as State,
  menuState: {} as State,
  levelOverState: {} as State,
}

async function startGame() {
  await populateMaterials();

  gameStates.gameState = new GameState();
  gameStates.menuState = new MenuState();
  gameStates.levelOverState = new LevelOverState();

  createGameStateMachine(gameStates.gameState, 2);

  let previousTime = 0;
  const interval = 1000 / 60;

  draw(0);

  function draw(currentTime: number) {
    controls.queryController();
    const delta = currentTime - previousTime;

    if (delta >= interval) {
      previousTime = currentTime - (delta % interval);

      getGameStateMachine().getState().onUpdate(delta);
    }

    requestAnimationFrame(draw);
  }
}

startGame();
