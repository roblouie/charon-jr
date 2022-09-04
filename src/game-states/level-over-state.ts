import { Scene } from '@/engine/renderer/scene';
import { State } from '@/core/state';
import { Skybox } from '@/skybox';
import { canvasPatterns, materials } from '@/texture-maker';
import { Camera } from '@/engine/renderer/camera';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { renderer } from '@/engine/renderer/renderer';
import { controls } from '@/core/controls';
import { getGameStateMachine } from '@/game-state-machine';
import { gameState } from '@/game-states/game-state';
import { drawEngine } from '@/core/draw-engine';
import { menuState } from '@/game-states/menu-state';

class LevelOverState implements State {
  spiritsTransported = 0;
  score = 0;
  rank: 'F' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' = 'F';

  onEnter(spiritsTransported: number, score: number) {
    this.spiritsTransported = spiritsTransported;
    this.score = score;
  }

  onUpdate() {
    drawEngine.clear();

    drawEngine.context.globalCompositeOperation = 'source-over';
    drawEngine.context.fillStyle = canvasPatterns.dirt;
    drawEngine.context.fillRect(0, 0, 1280, 720);
    drawEngine.context.globalCompositeOperation = 'destination-atop';

    drawEngine.drawText('TIME UP','bold italic 80px Times New Roman, serif-black', 640, 170, 0, 'white');

    drawEngine.context.globalCompositeOperation = 'source-over';
    drawEngine.drawText('SPIRITS TRANSPORTED','bold italic 30px monospace',320, 350, 1, 'black', 'left');
    drawEngine.drawText(this.spiritsTransported.toString(), 'bold italic 30px monospace', 960, 350, 1, 'black', 'right');
    drawEngine.drawText('PAYMENT COLLECTED', 'bold italic 30px monospace', 320, 400, 1, 'black', 'left');
    drawEngine.drawText(this.score.toString(), 'bold italic 30px monospace', 960, 400,  1, 'black', 'right');

    drawEngine.drawText('RANK', 'bold italic 30px monospace', 640, 500, 1);
    drawEngine.drawText(this.rank, 'bold italic 120px Times New Roman, serif-black', 640, 620, 1);

    drawEngine.context.globalCompositeOperation = 'destination-over';
    drawEngine.context.fillStyle = 'black';
    drawEngine.context.fillRect(0, 80, 1280, 140);
    drawEngine.context.fillStyle = '#0008';
    drawEngine.context.fillRect(0, 0, 1280, 720);

    if (controls.isSpace) {
      getGameStateMachine().setState(menuState);
    }
  }

  onLeave() {
    drawEngine.clear();
  }
}

export const levelOverState = new LevelOverState();
