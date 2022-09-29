import { StateMachine } from '../engine/state-machine/state-machine';
import { State } from '../engine/state-machine/state';

// @ts-ignore
export let gameStateMachine;

export function createGameStateMachine(initialState: State, ...initialArguments: any[]) {
  gameStateMachine = new StateMachine(initialState, ...initialArguments);
}
