import type { Measurement } from "./Measurement.js"
import { Point3D } from "./Point3D.js"

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
  convert(distance: Readonly<Distance>, newUnit: UnitOfDistance): Distance {
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
  in({ value, unit }: Readonly<Distance>, newUnit: UnitOfDistance): number {
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
  areEqual(distance1: Readonly<Distance>, distance2: Readonly<Distance>, tolerance: Readonly<Distance>): boolean {
    const difference = Distance.in(distance1, tolerance.unit) - Distance.in(distance2, tolerance.unit)

    return Math.abs(difference) <= tolerance.value
  },

  /**
   * Computes the squared distance between two positions.
   * @param position1 The first position.
   * @param position2 The second position.
   * @param unitOfReference The unit to use to compare the positions. This unit will also be the unit of the resulting Distance.
   *   If not defined, a random unit will be used. Specifying your unit can help mitigate floating point errors.
   */
  betweenSquared(position1: Readonly<Point3D>, position2: Readonly<Point3D>, unitOfReference?: UnitOfDistance): Distance {
    const actualUnitOfReference = unitOfReference ?? position1.x.unit
    const xyz1 = Point3D.in(position1, actualUnitOfReference)
    const xyz2 = Point3D.in(position2, actualUnitOfReference)

    const distanceValue = Math.pow(xyz1.x - xyz2.x, 2) + Math.pow(xyz1.y - xyz2.y, 2) + Math.pow(xyz1.z - xyz2.z, 2)

    return Distance.create(distanceValue, actualUnitOfReference)
  },

  /**
   * Computes the distance between two positions.
   * @param position1 The first position.
   * @param position2 The second position.
   * @param unitOfReference The unit to use to compare the positions. This unit will also be the unit of the resulting Distance.
   *   If not defined, a random unit will be used. Specifying your unit can help mitigate floating point errors.
   */
  between(position1: Readonly<Point3D>, position2: Readonly<Point3D>, unitOfReference?: UnitOfDistance): Distance {
    const distance = Distance.betweenSquared(position1, position2, unitOfReference)
    distance.value = Math.sqrt(distance.value)

    return distance
  },
}
