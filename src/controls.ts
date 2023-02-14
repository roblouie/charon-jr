import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

class Controls {
  isUp = false;
  isDown = false;
  isSelect?: boolean = false;
  accel = 0;
  decel = 0;
  inputDirection: EnhancedDOMPoint;

  keyMap: Map<string, boolean> = new Map();
  previousState = { isUp: this.isUp, isDown: this.isDown, isSelect: this.isSelect };

  constructor() {
    document.addEventListener('keydown', event => this.toggleKey(event, true));
    document.addEventListener('keyup', event => this.toggleKey(event, false));
    this.inputDirection = new EnhancedDOMPoint();
  }

  queryController() {
    this.previousState.isUp = this.isUp;
    this.previousState.isDown = this.isDown;
    this.previousState.isSelect = this.isSelect;
    const gamepad = navigator.getGamepads()[0];
    const leftVal = (this.keyMap.get('KeyA') || this.keyMap.get('ArrowLeft') || gamepad?.buttons[14]?.pressed) ? -1 : 0;
    const rightVal = (this.keyMap.get('KeyD') || this.keyMap.get('ArrowRight') || gamepad?.buttons[15].pressed) ? 1 : 0;
    this.inputDirection.x = (leftVal + rightVal) || gamepad?.axes[0] || 0;
    this.inputDirection.y = gamepad?.axes[1] ?? 0;

    if (this.inputDirection.magnitude < 0.1) {
      this.inputDirection.x = 0; this.inputDirection.y = 0;
    }

    const keyboardUp = this.keyMap.get('KeyW') || this.keyMap.get('ArrowUp');
    const keyboardDown = this.keyMap.get('KeyS') || this.keyMap.get('ArrowDown');

    this.isUp = keyboardUp || gamepad?.buttons[12]?.pressed || this.inputDirection.y < 0;
    this.isDown = keyboardDown || gamepad?.buttons[13].pressed || this.inputDirection.y > 0;

    this.accel = keyboardUp ? 1 : (gamepad?.buttons[7]?.value ?? 0);
    this.decel = keyboardDown ? 1 : (gamepad?.buttons[6]?.value ?? 0);
    this.isSelect = this.keyMap.get('Enter') || gamepad?.buttons[0].pressed || gamepad?.buttons[9].pressed;
  }

  private toggleKey(event: KeyboardEvent, isPressed: boolean) {
    this.keyMap.set(event.code, isPressed);
  }
}

export const controls = new Controls();
