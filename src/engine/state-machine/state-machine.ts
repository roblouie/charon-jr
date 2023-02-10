import { State } from './state';

export class StateMachine {
  private currentState: State;

  constructor(initialState: State, ...enterArgs: any) {
    this.currentState = initialState;
    this.currentState.onEnter ? this.currentState.onEnter(...enterArgs) : null;
  }

  async setState(newState: State, ...enterArgs: any) {
    this.currentState.onLeave ? await this.currentState.onLeave() : null;
    this.currentState = newState;
    this.currentState.onEnter ? await this.currentState.onEnter(...enterArgs) : null;
  }

  getState() {
    return this.currentState;
  }
}
