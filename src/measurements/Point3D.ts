import { TypeGuard } from "../TypeGuard.js"
import { Distance, UnitOfDistance } from "./Distance.js"

/**
 * Represents a position in 3D space
 */
export type Point3D = {
  x: Distance
  y: Distance
  z: Distance
}

export type XYZ = {
  x: Distance["value"]
  y: Distance["value"]
  z: Distance["value"]
}

/**
 * A set of functions to work with Positions.
 */
export const Point3D = {
  /**
   * Builds a position from XYZ with the same unit.
   * @param x The x value
   * @param y The y value
   * @param z The z value
   * @param unit The unit to use for all values
   */
  create({ x, y, z }: Readonly<XYZ>, unit: UnitOfDistance): Point3D {
    return {
      x: { value: x, unit },
      y: { value: y, unit },
      z: { value: z, unit },
    }
  },

  /**
   * Converts x, y, and z to the given unit.
   * The unit can be a UnitOfDistance, or another Position.
   * When the unit is a Position, each value will be converted to the matching Position's unit.
   * @param position The position to convert.
   * @param unit The unit(s) to convert to.
   */
  convert({ x, y, z }: Readonly<Point3D>, unit: Readonly<Point3D> | UnitOfDistance): Point3D {
    if (TypeGuard.isEnumMember(UnitOfDistance, unit)) {
      return {
        x: Distance.convert(x, unit),
        y: Distance.convert(y, unit),
        z: Distance.convert(z, unit),
      }
    }

    return {
      x: Distance.convert(x, unit.x.unit),
      y: Distance.convert(y, unit.y.unit),
      z: Distance.convert(z, unit.z.unit),
    }
  },

  /**
   * Converts x, y, and z to the given unit and returns the values
   * @param position The position to convert.
   * @param newUnit The new unit to convert to.
   */
  in({ x, y, z }: Readonly<Point3D>, newUnit: UnitOfDistance): XYZ {
    return {
      x: Distance.in(x, newUnit),
      y: Distance.in(y, newUnit),
      z: Distance.in(z, newUnit),
    }
  },

  /**
   * Determines if two positions are equal given a certain tolerance.
   * The positions will be converted in the tolerance unit before comparison.
   * @param position1 The first position to compare.
   * @param position2 The second position to compare.
   * @param tolerance The allowed tolerance.
   */
  areEqual(position1: Readonly<Point3D>, position2: Readonly<Point3D>, tolerance: Readonly<Distance>): boolean {
    const distance = Distance.between(position1, position2, tolerance.unit)

    return Math.abs(distance.value) <= tolerance.value
  },
}
