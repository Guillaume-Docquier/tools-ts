import type { Range } from "../Range.js"
import { boxMullerSample } from "./boxMullerSample.js"
import type { Generator } from "./Generator.js"

export type RngState<TGeneratorState> = {
  generatorState: TGeneratorState
  spareNormal: number | null
}

export type Rng<TGeneratorState = unknown> = {
  /**
   * Generates a random number based on the given Range.
   * It will output an int given an int Range, or a float given a float Range.
   */
  random: (range: Range) => number

  /**
   * Generates a float in the float Range.
   * When no range is provided, returns a float in the range [0, 1).
   */
  float: (range?: Range<"float">) => number

  /**
   * Generates an int in the int Range.
   */
  int: (range: Range<"integer">) => number

  /**
   * Shuffles an array in place.
   */
  shuffle: <T>(values: T[]) => T[]

  /**
   * Draws a number of elements without modifying the original array.
   */
  draw: <T>(values: T[], count: number) => { drawn: T[]; remaining: T[] }

  /**
   * Returns a random number from a normal distribution.
   *
   * The mean is the center of the distribution (default: 0)
   * The std is the spread of the distribution (default: 1)
   */
  normal: (mean?: number, std?: number) => number

  /**
   * Returns the state required to resume the random sequence.
   */
  getState: () => RngState<TGeneratorState>
}

const intBoundsOffset = {
  inclusive: 1,
  exclusive: 0,
} as const satisfies Record<Range["maxBoundType"], number>

export const Rng = {
  /**
   * Creates a random number generator based on your generator of choice.
   * @param generator The generator that returns numbers in the range [0, 1)
   */
  create<TGeneratorState>(generator: Generator<TGeneratorState>): Rng<TGeneratorState> {
    return createRng(generator, null)
  },

  /**
   * Restores a random number generator from previously captured state.
   */
  fromState<TGeneratorState>(
    state: RngState<TGeneratorState>,
    createGenerator: (state: TGeneratorState) => Generator<TGeneratorState>,
  ): Rng<TGeneratorState> {
    return createRng(createGenerator(state.generatorState), state.spareNormal)
  },
}

function createRng<TGeneratorState>(generator: Generator<TGeneratorState>, initialSpareNormal: number | null): Rng<TGeneratorState> {
  function random(range: Range): number {
    switch (range.numericType) {
      case "float":
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fact we have to cast like this sucks a little bit, we'll see if we have to do this often or not.
        return float(range as Range<typeof range.numericType>)
      case "integer":
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fact we have to cast like this sucks a little bit, we'll see if we have to do this often or not.
        return int(range as Range<typeof range.numericType>)
    }
  }

  function float(range?: Range<"float">): number {
    if (range === undefined) {
      return generator.next()
    }

    // Because of floating point errors, this is inclusive when min > 1, but that's statistically insignificant.
    return range.min + generator.next() * (range.max - range.min)
  }

  function int(range: Range<"integer">): number {
    // We +1 the max because float is exclusive of the max, but for int we want the range to be inclusive.
    // We floor before the addition, because the addition can lose precision and generate numbers that are out of bounds when float ~= 1.
    // We don't use Math.floor(float(rangeWithMaxPlus1)) for the same reason
    return range.min + Math.floor(float() * (range.max + intBoundsOffset[range.maxBoundType] - range.min))
  }

  /**
   * Fisher-Yates shuffle in place.
   */
  function shuffle<T>(values: Array<Readonly<T>>): T[] {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(generator.next() * (i + 1))
      ;[values[i], values[j]] = [values[j], values[i]]
    }

    return values
  }

  function draw<T>(values: ReadonlyArray<Readonly<T>>, count: number): { drawn: T[]; remaining: T[] } {
    const shuffled = shuffle(values.slice())

    return {
      drawn: shuffled,
      remaining: shuffled.splice(count),
    }
  }

  /**
   * box-muller outputs 2 numbers, so we keep the extra value that we can return instead of recomputing
   */
  let spareNormal = initialSpareNormal
  function normal(mean = 0, std = 1): number {
    if (spareNormal !== null) {
      const value = spareNormal
      spareNormal = null
      return mean + std * value
    }

    // u1 must be non-zero
    let u1
    do {
      u1 = generator.next()
    } while (u1 === 0)

    const { z1, z2 } = boxMullerSample(u1, generator.next())

    spareNormal = z1
    return mean + std * z2
  }

  function getState(): RngState<TGeneratorState> {
    return {
      generatorState: generator.getState(),
      spareNormal,
    }
  }

  return {
    random,
    float,
    int,
    shuffle,
    draw,
    normal,
    getState,
  }
}
