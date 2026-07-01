import { Measurement } from "./Measurement.js"

/**
 * Represents the possible units to define time.
 */
export enum UnitOfTime {
  MILLISECONDS = "milliseconds",
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
}

/**
 * The definition of factors of time, where the base unit is the second.
 * 1 minute is 1/60th of a second.
 */
const TIME_PER_SECONDS: Record<UnitOfTime, number> = {
  [UnitOfTime.MILLISECONDS]: 1000,
  [UnitOfTime.SECONDS]: 1,
  [UnitOfTime.MINUTES]: 1 / 60,
  [UnitOfTime.HOURS]: 1 / 60 / 60,
}

/**
 * Represents a time with its unit
 */
export type Time = Measurement<UnitOfTime>

/**
 * A set of functions to work with Times.
 */
export const Time = {
  create: (value: number, unit: UnitOfTime) => {
    return {
      value,
      unit,
    }
  },

  /**
   * Converts a time to another unit of time.
   * The provided time is left untouched.
   * @param time The time to convert.
   * @param newUnit The new unit to convert to.
   * @returns A new Time with the requested unit of time.
   */
  convert(time: Time, newUnit: UnitOfTime): Time {
    return {
      value: Time.in(time, newUnit),
      unit: newUnit,
    }
  },

  /**
   * Returns the value of the time in the given unit of time.
   * @param time The time to get the value of.
   * @param newUnit The unit of time to get the value of the time in.
   */
  in(time: Time, newUnit: UnitOfTime): number {
    return (time.value * TIME_PER_SECONDS[newUnit]) / TIME_PER_SECONDS[time.unit]
  },

  /**
   * Adds 2 times together. The unit of the first time will be used.
   */
  add(timeA: Time, timeB: Time): Time {
    return Time.create(timeA.value + Time.in(timeB, timeA.unit), timeA.unit)
  },

  /**
   * Subtracts 2 times. The unit of the first time will be used.
   */
  subtract(timeA: Time, timeB: Time): Time {
    return Time.create(timeA.value - Time.in(timeB, timeA.unit), timeA.unit)
  },
}
