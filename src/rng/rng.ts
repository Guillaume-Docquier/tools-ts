import type { Range } from "../Range.js"

/**
 * A generator that returns numbers in the range [0, 1)
 */
export type Generator = () => number

export type Rng = {
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
}

const intBoundsOffset = {
  inclusive: 1,
  exclusive: 0,
} as const satisfies Record<Range["maxBoundType"], number>

/**
 * Creates a random number generator based on your generator of choice.
 * @param generator The generator that returns numbers in the range [0, 1)
 */
export function createRng(generator: Generator): Rng {
  function random(range: Range): number {
    switch (range.numericType) {
      case "float":
        // The fact we have to cast like this sucks a little bit, we'll see if we have to do this often or not.
        return float(range as Range<typeof range.numericType>)
      case "integer":
        // The fact we have to cast like this sucks a little bit, we'll see if we have to do this often or not.
        return int(range as Range<typeof range.numericType>)
    }
  }

  function float(range?: Range<"float">): number {
    if (range === undefined) {
      return generator()
    }

    // Because of floating point errors, this is inclusive when min > 1, but that's statistically insignificant.
    return range.min + generator() * (range.max - range.min)
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
      const j = Math.floor(generator() * (i + 1))
      ;[values[i], values[j]] = [values[j] as T, values[i] as T]
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

  return {
    random,
    float,
    int,
    shuffle,
    draw,
  }
}
