import type { Measurement } from "./Measurement.js"

export enum UnitOfDistance {
  METERS = "Meters",
  MILLIMETERS = "Millimeters",
  ASTRONOMICAL_UNITS = "Astronomical Units",
  LIGHT_YEARS = "Light Years",
}

/**
 * The definition of distances in meters.
 * 1 millimeter is 0.001 meters.
 * 1 astronomical unit is 149,597,870,700 meters.
 * 1 light-year is 9,460,730,472,580,800 meters.
 */
const METERS_PER_DISTANCE: Record<UnitOfDistance, number> = {
  [UnitOfDistance.MILLIMETERS]: 0.001,
  [UnitOfDistance.METERS]: 1,
  [UnitOfDistance.ASTRONOMICAL_UNITS]: 149_597_870_700,
  [UnitOfDistance.LIGHT_YEARS]: 9_460_730_472_580_800,
}

/**
 * Represents a distance with its unit
 */
export type Distance = Measurement<UnitOfDistance>

/**
 * A set of functions to work with Distances.
 */
export const Distance = {
  /**
   * Creates a distance.
   * @param value The value for the distance.
   * @param unit The unit for the distance.
   */
  create(value: number, unit: UnitOfDistance): Distance {
    return { value, unit }
  },

  /**
   * Converts a distance to another unit of distance.
   * The provided distance is left untouched.
   * @param distance The distance to convert.
   * @param newUnit The unit to convert to.
   * @returns A new Distance with the requested unit of distance.
   */
  convert(distance: Distance, newUnit: UnitOfDistance): Distance {
    return {
      value: Distance.in(distance, newUnit),
      unit: newUnit,
    }
  },

  /**
   * Returns the value of the distance in the given unit of distance.
   * @param distance The distance to get the value of.
   * @param newUnit The unit of distance to get the value of the distance in.
   */
  in({ value, unit }: Distance, newUnit: UnitOfDistance): number {
    if (unit === newUnit) {
      return value
    }

    return (value * METERS_PER_DISTANCE[unit]) / METERS_PER_DISTANCE[newUnit]
  },

  /**
   * Determines if two distances are equal given a certain tolerance.
   * The distances will be converted in the tolerance unit before comparison.
   * @param distance1 The first distance to compare.
   * @param distance2 The second distance to compare.
   * @param tolerance The allowed tolerance.
   */
  areEqual(distance1: Distance, distance2: Distance, tolerance: Distance): boolean {
    const difference = Distance.in(distance1, tolerance.unit) - Distance.in(distance2, tolerance.unit)

    return Math.abs(difference) <= tolerance.value
  },
}
