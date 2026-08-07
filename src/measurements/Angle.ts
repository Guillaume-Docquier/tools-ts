import type { Measurement } from "./Measurement.js"

/**
 * Represents the possible units to define an angle.
 */
export enum UnitOfAngle {
  DEGREES = "degrees",
  RADIANS = "radians",
}

const RADIANS_PER_ANGLE: Record<UnitOfAngle, number> = {
  [UnitOfAngle.DEGREES]: Math.PI / 180,
  [UnitOfAngle.RADIANS]: 1,
}

/**
 * Represents an angle with its unit.
 */
export type Angle = Measurement<UnitOfAngle>

/**
 * A set of functions to work with angles.
 */
export const Angle = {
  /**
   * Creates an angle.
   */
  create(value: number, unit: UnitOfAngle): Angle {
    return { value, unit }
  },

  /**
   * Converts an angle to another unit.
   * The provided angle is left untouched.
   */
  convert(angle: Readonly<Angle>, newUnit: UnitOfAngle): Angle {
    return {
      value: Angle.in(angle, newUnit),
      unit: newUnit,
    }
  },

  /**
   * Returns the value of the angle in the given unit.
   */
  in({ value, unit }: Readonly<Angle>, newUnit: UnitOfAngle): number {
    if (unit === newUnit) {
      return value
    }

    return (value * RADIANS_PER_ANGLE[unit]) / RADIANS_PER_ANGLE[newUnit]
  },
}
