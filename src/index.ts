import { Camera } from './engine/renderer/camera';
import { Mesh } from './engine/renderer/mesh';
import { MoldableCubeGeometry } from './engine/moldable-cube-geometry';
import { Material } from './engine/renderer/material';
import { getGroupedFaces } from './engine/physics/parse-faces';
import { PlaneGeometry } from './engine/plane-geometry';
import { Staircase } from './staircase-geometry';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { AttributeLocation, Renderer } from "@/engine/renderer/renderer";
import {
  drawBricks,
  drawCurrentTexture,
  drawGrass,
  drawLandscape,
  drawMarble, drawParticle, drawSky,
  drawStoneWalkway, drawVolcanicRock, drawWater
} from '@/texture-maker';
import { textureLoader } from '@/engine/renderer/texture-loader';
import { controls } from '@/core/controls';
import { ThirdPersonPlayer } from '@/third-person-player';
import { Scene } from '@/engine/renderer/scene';
import { Skybox } from '@/skybox';
import { doTimes } from '@/engine/helpers';
import { audioCtx, getAudioPlayer, panner } from '@/engine/audio/audio-player';
import { createGameStateMachine, getGameStateMachine } from '@/game-state-machine';
import { gameState } from '@/game-states/game-state';
import { menuState } from '@/game-states/menu-state';

const debugElement = document.querySelector('#debug')!;


// TESTING
// drawCurrentTexture();
// END TESTING



createGameStateMachine(menuState);

let previousTime = 0;
const maxFps = 60;
const interval = 1000 / maxFps;

draw(0);

function draw(currentTime: number) {
  controls.queryController();
  const delta = currentTime - previousTime;

  if (delta >= interval || !previousTime) {
    previousTime = currentTime - (delta % interval);

    getGameStateMachine().getState().onUpdate(delta);
  }

  requestAnimationFrame(draw);
}
