import { Camera } from './engine/renderer/camera';
import { Mesh } from './engine/renderer/mesh';
import { CubeGeometry } from './engine/cube-geometry';
import { Material } from './engine/renderer/material';
import { getGroupedFaces } from './engine/physics/parse-faces';
import { PlaneGeometry } from './engine/plane-geometry';
import { Staircase } from './staircase-geometry';
import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
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
drawCurrentTexture();
// END TESTING



createGameStateMachine(menuState);

// let lastTime = 0;
draw(0);


function draw(time: number) {
  controls.queryController();
  // debugElement.textContent = `${1 / ((time - lastTime) / 1000)} fps`;
  // lastTime = time;

  getGameStateMachine().getState().onUpdate(time);

  requestAnimationFrame(draw);
}
