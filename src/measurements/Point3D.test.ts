import { describe, expect, it } from "vitest"
import { Distance, UnitOfDistance } from "./Distance.js"
import { Point3D } from "./Point3D.js"

describe("Point3D", () => {
  describe("create", () => {
    it("should create all coordinates with the requested unit", () => {
      // Act
      const point = Point3D.create({ x: -1, y: 0, z: 2.5 }, UnitOfDistance.METERS)

      // Assert
      expect(point).toEqual({
        x: Distance.create(-1, UnitOfDistance.METERS),
        y: Distance.create(0, UnitOfDistance.METERS),
        z: Distance.create(2.5, UnitOfDistance.METERS),
      })
    })
  })

  describe("convert", () => {
    it("should convert every coordinate to one requested unit without modifying the source", () => {
      // Arrange
      const point = {
        x: Distance.create(1, UnitOfDistance.METERS),
        y: Distance.create(2_000, UnitOfDistance.MILLIMETERS),
        z: Distance.create(3, UnitOfDistance.METERS),
      }
      const original = structuredClone(point)

      // Act
      const converted = Point3D.convert(point, UnitOfDistance.MILLIMETERS)

      // Assert
      expect(converted).toEqual({
        x: Distance.create(1_000, UnitOfDistance.MILLIMETERS),
        y: Distance.create(2_000, UnitOfDistance.MILLIMETERS),
        z: Distance.create(3_000, UnitOfDistance.MILLIMETERS),
      })
      expect(point).toEqual(original)
      expect(converted).not.toBe(point)
    })

    it("should convert each coordinate to the matching unit of a reference point", () => {
      // Arrange
      const point = Point3D.create({ x: 1, y: 2, z: 3 }, UnitOfDistance.METERS)
      const reference = {
        x: Distance.create(0, UnitOfDistance.MILLIMETERS),
        y: Distance.create(0, UnitOfDistance.METERS),
        z: Distance.create(0, UnitOfDistance.ASTRONOMICAL_UNITS),
      }

      // Act
      const converted = Point3D.convert(point, reference)

      // Assert
      expect(converted.x).toEqual(Distance.create(1_000, UnitOfDistance.MILLIMETERS))
      expect(converted.y).toEqual(Distance.create(2, UnitOfDistance.METERS))
      expect(converted.z.unit).toBe(UnitOfDistance.ASTRONOMICAL_UNITS)
      expect(converted.z.value).toBeCloseTo(3 / 149_597_870_700, 15)
    })
  })

  describe("in", () => {
    it("should return coordinate values converted from independently-unitized axes", () => {
      // Arrange
      const point = {
        x: Distance.create(1, UnitOfDistance.METERS),
        y: Distance.create(2_000, UnitOfDistance.MILLIMETERS),
        z: Distance.create(3 / 149_597_870_700, UnitOfDistance.ASTRONOMICAL_UNITS),
      }

      // Act
      const values = Point3D.in(point, UnitOfDistance.METERS)

      // Assert
      expect(values.x).toBe(1)
      expect(values.y).toBe(2)
      expect(values.z).toBeCloseTo(3, 12)
    })
  })

  describe("areEqual", () => {
    it.each([
      {
        description: "identical points with zero tolerance",
        point1: Point3D.create({ x: -1, y: 0, z: 1 }, UnitOfDistance.METERS),
        point2: Point3D.create({ x: -1, y: 0, z: 1 }, UnitOfDistance.METERS),
        tolerance: Distance.create(0, UnitOfDistance.METERS),
      },
      {
        description: "points exactly at the inclusive tolerance boundary",
        point1: Point3D.create({ x: 0, y: 0, z: 0 }, UnitOfDistance.METERS),
        point2: Point3D.create({ x: 3, y: 4, z: 12 }, UnitOfDistance.METERS),
        tolerance: Distance.create(13, UnitOfDistance.METERS),
      },
      {
        description: "equivalent points expressed in different units",
        point1: Point3D.create({ x: 1, y: -2, z: 3 }, UnitOfDistance.METERS),
        point2: Point3D.create({ x: 1_000, y: -2_000, z: 3_000 }, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(0, UnitOfDistance.MILLIMETERS),
      },
    ])("should consider $description equal", ({ point1, point2, tolerance }) => {
      // Act
      const areEqual = Point3D.areEqual(point1, point2, tolerance)

      // Assert
      expect(areEqual).toBe(true)
    })

    it("should consider points beyond the tolerance unequal regardless of argument order", () => {
      // Arrange
      const point1 = Point3D.create({ x: 0, y: 0, z: 0 }, UnitOfDistance.METERS)
      const point2 = Point3D.create({ x: 3, y: 4, z: 12 }, UnitOfDistance.METERS)
      const tolerance = Distance.create(12_999.999, UnitOfDistance.MILLIMETERS)

      // Act & Assert
      expect(Point3D.areEqual(point1, point2, tolerance)).toBe(false)
      expect(Point3D.areEqual(point2, point1, tolerance)).toBe(false)
    })
  })
})
