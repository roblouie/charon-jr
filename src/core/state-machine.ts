import { State } from './state';

export class StateMachine {
  private currentState: State;

  constructor(initialState: State) {
    this.currentState = initialState;
  }

  setState(newState: State, ...enterArgs: any) {
    this.currentState.onLeave ? this.currentState.onLeave() : null;
    this.currentState = newState;
    this.currentState.onEnter ? this.currentState.onEnter(...enterArgs) : null;
  }

  getState() {
    return this.currentState;
  }
}
