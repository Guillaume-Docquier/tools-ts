import { Time, UnitOfTime } from "./measurements/Time.js"

/**
 * Utilities to measure time elapsed easily. Uses Performance under the hood.
 */
export const Timer = {
  /**
   * Captures a start time
   */
  start(): Time {
    return Time.create(performance.now(), UnitOfTime.MILLISECONDS)
  },

  /**
   * Returns the time elapsed since another time
   *
   * @example
   * ```ts
   * const startTime = Timer.start()
   * // do things
   * const elapsed = Timer.since(startTime)
   * ```
   */
  since(time: Time): Time {
    return Time.subtract(Timer.start(), time)
  },
}
