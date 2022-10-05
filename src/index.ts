import {populateMaterials } from '@/texture-maker';
import { controls } from '@/controls';
import { createGameStateMachine, gameStateMachine } from '@/game-states/game-state-machine';
import { GameState } from '@/game-states/game.state';
import { MenuState } from '@/game-states/menu.state';
import { LevelOverState } from '@/game-states/level-over.state';
import { State } from '@/engine/state-machine/state';

export const gameStates = {
  gameState: {} as State,
  menuState: {} as State,
  levelOverState: {} as State,
};

(async () => {
  await populateMaterials();

  gameStates.gameState = new GameState();
  gameStates.menuState = new MenuState();
  gameStates.levelOverState = new LevelOverState();

  createGameStateMachine(gameStates.menuState);

  let previousTime = 0;
  const interval = 1000 / 60;

  draw(0);

  function draw(currentTime: number) {
    const delta = currentTime - previousTime;

    if (delta >= interval) {
      previousTime = currentTime - (delta % interval);

      controls.queryController();
      gameStateMachine.getState().onUpdate(delta);
    }

    requestAnimationFrame(draw);
  }
})();
