import { TypeGuard } from "../TypeGuard.js"
import { Distance, UnitOfDistance } from "./Distance.js"

/**
 * Represents a position in 2D space.
 */
export type Point2D = {
  x: Distance
  y: Distance
}

export type XY = {
  x: Distance["value"]
  y: Distance["value"]
}

/**
 * A set of functions to work with 2D positions.
 */
export const Point2D = {
  /**
   * Builds a position from XY values with the same unit.
   */
  create({ x, y }: Readonly<XY>, unit: UnitOfDistance): Point2D {
    return {
      x: Distance.create(x, unit),
      y: Distance.create(y, unit),
    }
  },

  /**
   * Converts x and y to one unit or to the matching units of another position.
   * The provided position is left untouched.
   */
  convert({ x, y }: Readonly<Point2D>, unit: Readonly<Point2D> | UnitOfDistance): Point2D {
    if (TypeGuard.isEnumMember(UnitOfDistance, unit)) {
      return {
        x: Distance.convert(x, unit),
        y: Distance.convert(y, unit),
      }
    }

    return {
      x: Distance.convert(x, unit.x.unit),
      y: Distance.convert(y, unit.y.unit),
    }
  },

  /**
   * Converts x and y to the given unit and returns their values.
   */
  in({ x, y }: Readonly<Point2D>, newUnit: UnitOfDistance): XY {
    return {
      x: Distance.in(x, newUnit),
      y: Distance.in(y, newUnit),
    }
  },

  /**
   * Determines if two positions are within an inclusive distance tolerance.
   */
  areEqual(position1: Readonly<Point2D>, position2: Readonly<Point2D>, tolerance: Readonly<Distance>): boolean {
    const xy1 = Point2D.in(position1, tolerance.unit)
    const xy2 = Point2D.in(position2, tolerance.unit)
    const distance = Math.hypot(xy1.x - xy2.x, xy1.y - xy2.y)

    return distance <= tolerance.value
  },
}
