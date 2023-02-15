import { State } from './state';

export class StateMachine {
  private currentState: State;

  constructor(initialState: State, ...enterArgs: any) {
    this.currentState = initialState;
    this.currentState.onEnter?.(...enterArgs);
  }

  async setState(newState: State, ...enterArgs: any) {
    await this.currentState.onLeave?.();
    this.currentState = newState;
    await this.currentState.onEnter?.(...enterArgs);
  }

  getState() {
    return this.currentState;
  }
}
