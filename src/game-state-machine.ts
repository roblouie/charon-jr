import { StateMachine } from './core/state-machine';
import { State } from './core/state';

// @ts-ignore
export let gameStateMachine;

export function createGameStateMachine(initialState: State, ...initialArguments: any[]) {
  gameStateMachine = new StateMachine(initialState, ...initialArguments);
}
