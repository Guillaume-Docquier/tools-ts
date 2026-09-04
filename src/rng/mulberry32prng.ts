import type { Generator } from "./Generator.js"

/**
 * Creates a deterministic pseudo-random number generator based on a 32-bit integer seed using the mulberry32 algorithm.
 *
 * It generates floats in the range [0, 1)
 */
export function mulberry32Prng(seed: number): Generator<number> {
  let state = seed >>> 0

  return {
    next: () => {
      state = (state + 0x6d2b79f5) >>> 0

      let next = state
      next = Math.imul(next ^ (next >>> 15), next | 1)
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61)

      return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296
    },
    getState: () => state,
  }
}
