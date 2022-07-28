import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

class Controls {
  isUp = false;
  isDown = false;
  isLeft = false;
  isRight = false;
  isEnter = false;
  isSpace = false;
  isEscape = false;
  direction: EnhancedDOMPoint;
  isJumpPressed = false;

  constructor() {
    document.addEventListener('keydown', event => this.toggleKey(event, true));
    document.addEventListener('keyup', event => this.toggleKey(event, false));
    this.direction = new EnhancedDOMPoint();
  }

  queryController() {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad) {
      this.direction.x = gamepad.axes[0];
      this.direction.z = gamepad.axes[1];

      const deadzone = 0.08;
      if (this.direction.magnitude < deadzone) {
        this.direction.x = 0; this.direction.z = 0;
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
    this.direction.x = (Number(this.isLeft) * -1) + Number(this.isRight);
    this.direction.z = (Number(this.isUp) * -1) + Number(this.isDown);
  }
}

export const controls = new Controls();
