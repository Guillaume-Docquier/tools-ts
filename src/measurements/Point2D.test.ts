import { describe, expect, it } from "vitest"
import { Distance, UnitOfDistance } from "./Distance.js"
import { Point2D } from "./Point2D.js"

describe("Point2D", () => {
  describe("create", () => {
    it("should create both coordinates with the requested unit", () => {
      expect(Point2D.create({ x: -1, y: 2.5 }, UnitOfDistance.METERS)).toEqual({
        x: Distance.create(-1, UnitOfDistance.METERS),
        y: Distance.create(2.5, UnitOfDistance.METERS),
      })
    })
  })

  describe("convert", () => {
    it("should convert every coordinate to one unit without modifying the source", () => {
      const point = {
        x: Distance.create(1, UnitOfDistance.METERS),
        y: Distance.create(2_000, UnitOfDistance.MILLIMETERS),
      }
      const original = structuredClone(point)

      const converted = Point2D.convert(point, UnitOfDistance.MILLIMETERS)

      expect(converted).toEqual({
        x: Distance.create(1_000, UnitOfDistance.MILLIMETERS),
        y: Distance.create(2_000, UnitOfDistance.MILLIMETERS),
      })
      expect(point).toEqual(original)
      expect(converted).not.toBe(point)
    })

    it("should convert each coordinate to the matching unit of a reference point", () => {
      const point = Point2D.create({ x: 1, y: 2 }, UnitOfDistance.METERS)
      const reference = {
        x: Distance.create(0, UnitOfDistance.MILLIMETERS),
        y: Distance.create(0, UnitOfDistance.ASTRONOMICAL_UNITS),
      }

      const converted = Point2D.convert(point, reference)

      expect(converted.x).toEqual(Distance.create(1_000, UnitOfDistance.MILLIMETERS))
      expect(converted.y.unit).toBe(UnitOfDistance.ASTRONOMICAL_UNITS)
      expect(converted.y.value).toBeCloseTo(2 / 149_597_870_700, 15)
    })
  })

  describe("in", () => {
    it("should return values converted from independently-unitized axes", () => {
      const point = {
        x: Distance.create(1_000, UnitOfDistance.MILLIMETERS),
        y: Distance.create(2 / 149_597_870_700, UnitOfDistance.ASTRONOMICAL_UNITS),
      }

      const values = Point2D.in(point, UnitOfDistance.METERS)

      expect(values.x).toBe(1)
      expect(values.y).toBeCloseTo(2, 12)
    })
  })

  describe("areEqual", () => {
    it.each([
      {
        description: "identical points with zero tolerance",
        point1: Point2D.create({ x: -1, y: 1 }, UnitOfDistance.METERS),
        point2: Point2D.create({ x: -1, y: 1 }, UnitOfDistance.METERS),
        tolerance: Distance.create(0, UnitOfDistance.METERS),
      },
      {
        description: "points exactly at the inclusive tolerance boundary",
        point1: Point2D.create({ x: 0, y: 0 }, UnitOfDistance.METERS),
        point2: Point2D.create({ x: 3, y: 4 }, UnitOfDistance.METERS),
        tolerance: Distance.create(5, UnitOfDistance.METERS),
      },
      {
        description: "equivalent points expressed in different units",
        point1: Point2D.create({ x: 1, y: -2 }, UnitOfDistance.METERS),
        point2: Point2D.create({ x: 1_000, y: -2_000 }, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(0, UnitOfDistance.MILLIMETERS),
      },
    ])("should consider $description equal", ({ point1, point2, tolerance }) => {
      expect(Point2D.areEqual(point1, point2, tolerance)).toBe(true)
    })

    it("should consider points beyond the tolerance unequal regardless of argument order", () => {
      const point1 = Point2D.create({ x: 0, y: 0 }, UnitOfDistance.METERS)
      const point2 = Point2D.create({ x: 3, y: 4 }, UnitOfDistance.METERS)
      const tolerance = Distance.create(4_999.999, UnitOfDistance.MILLIMETERS)

      expect(Point2D.areEqual(point1, point2, tolerance)).toBe(false)
      expect(Point2D.areEqual(point2, point1, tolerance)).toBe(false)
    })
  })
})
