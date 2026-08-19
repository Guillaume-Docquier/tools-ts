/**
 * A stateful generator that returns numbers in the range [0, 1).
 * Its state must be serializable so the generated sequence can be resumed.
 */
export type Generator<TState = unknown> = {
  next: () => number
  getState: () => TState
}
