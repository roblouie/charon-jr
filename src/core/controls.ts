import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

class Controls {
  isUp = false;
  isDown = false;
  isLeft = false;
  isRight = false;
  isEnter = false;
  isSpace = false;
  isEscape = false;
  direction = 0;
  isJumpPressed = false;
  leftTrigger = 0;
  rightTrigger = 0;
  isGamepadAttached = false;

  constructor() {
    document.addEventListener('keydown', event => this.toggleKey(event, true));
    document.addEventListener('keyup', event => this.toggleKey(event, false));
  }

  queryController() {
    const gamepad = navigator.getGamepads()[0];
    this.isGamepadAttached = !!gamepad;
    if (gamepad) {
      // this.direction.x = gamepad.axes[0];
      this.direction = gamepad.axes[1];
      this.leftTrigger = gamepad.buttons[6].value;
      this.rightTrigger = gamepad.buttons[7].value;

      const deadzone = 0.1;
      if (this.direction < deadzone) {
        this.direction = 0;
      }
      this.isJumpPressed = gamepad.buttons[0].pressed;
    }
  }

  private toggleKey(event: KeyboardEvent, isPressed: boolean) {
    switch (event.code) {
      case 'KeyW':
        this.isUp = isPressed;
        break;
      case 'KeyS':
        this.isDown = isPressed;
        break;
      case 'KeyA':
        this.isLeft = isPressed;
        break;
      case 'KeyD':
        this.isRight = isPressed;
        break;
      case 'Enter':
        this.isEnter = isPressed;
        break;
      case 'Space':
        this.isSpace = isPressed;
        break;
      case 'Escape':
        this.isEscape = isPressed;
    }
    this.direction = (Number(this.isRight)) + (Number(this.isLeft) * -1);
    this.leftTrigger = this.isDown ? 1 : 0;
    this.rightTrigger = this.isUp ? 1 : 0;
  }
}

export const controls = new Controls();
