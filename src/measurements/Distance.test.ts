import { describe, it, expect } from "vitest"
import { Distance, UnitOfDistance } from "./Distance.js"

describe("Distance", () => {
  describe("convert", () => {
    const THEORY = [
      { from: { value: 2500, unit: UnitOfDistance.MILLIMETERS }, to: { value: 2500, unit: UnitOfDistance.MILLIMETERS } },
      { from: { value: 2500, unit: UnitOfDistance.MILLIMETERS }, to: { value: 2.5, unit: UnitOfDistance.METERS } },
      { from: { value: 2.5, unit: UnitOfDistance.METERS }, to: { value: 2500, unit: UnitOfDistance.MILLIMETERS } },
      { from: { value: 2.5, unit: UnitOfDistance.METERS }, to: { value: 2.5, unit: UnitOfDistance.METERS } },
      {
        from: { value: 2.5, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
        to: { value: 373_994_676_750, unit: UnitOfDistance.METERS },
      },
      {
        from: { value: 373_994_676_750, unit: UnitOfDistance.METERS },
        to: { value: 2.5, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
      },
      {
        from: { value: 2.5, unit: UnitOfDistance.LIGHT_YEARS },
        to: { value: 23_651_826_181_452_000, unit: UnitOfDistance.METERS },
      },
      {
        from: { value: 23_651_826_181_452_000, unit: UnitOfDistance.METERS },
        to: { value: 2.5, unit: UnitOfDistance.LIGHT_YEARS },
      },
      {
        from: { value: 2.5, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
        to: { value: 0.000_039_531_268_524_551_646, unit: UnitOfDistance.LIGHT_YEARS },
      },
      {
        from: { value: 2.5, unit: UnitOfDistance.LIGHT_YEARS },
        to: { value: 158_102.692_710_665_69, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
      },
    ]

    it.each(THEORY)("should convert $from.unit to $to.unit", ({ from, to }) => {
      // Act
      const converted = Distance.convert(from, to.unit)

      // Asset
      expect(converted.unit).toBe(to.unit)
      expect(converted.value).toBeCloseTo(to.value, 12)
    })
  })

  describe("in", () => {
    const THEORY = [
      { from: { value: 2500, unit: UnitOfDistance.MILLIMETERS }, to: { value: 2500, unit: UnitOfDistance.MILLIMETERS } },
      { from: { value: 2500, unit: UnitOfDistance.MILLIMETERS }, to: { value: 2.5, unit: UnitOfDistance.METERS } },
      { from: { value: 2.5, unit: UnitOfDistance.METERS }, to: { value: 2500, unit: UnitOfDistance.MILLIMETERS } },
      { from: { value: 2.5, unit: UnitOfDistance.METERS }, to: { value: 2.5, unit: UnitOfDistance.METERS } },
      {
        from: { value: 2.5, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
        to: { value: 373_994_676_750, unit: UnitOfDistance.METERS },
      },
      {
        from: { value: 373_994_676_750, unit: UnitOfDistance.METERS },
        to: { value: 2.5, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
      },
      {
        from: { value: 2.5, unit: UnitOfDistance.LIGHT_YEARS },
        to: { value: 23_651_826_181_452_000, unit: UnitOfDistance.METERS },
      },
      {
        from: { value: 23_651_826_181_452_000, unit: UnitOfDistance.METERS },
        to: { value: 2.5, unit: UnitOfDistance.LIGHT_YEARS },
      },
      {
        from: { value: 2.5, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
        to: { value: 0.000_039_531_268_524_551_646, unit: UnitOfDistance.LIGHT_YEARS },
      },
      {
        from: { value: 2.5, unit: UnitOfDistance.LIGHT_YEARS },
        to: { value: 158_102.692_710_665_69, unit: UnitOfDistance.ASTRONOMICAL_UNITS },
      },
    ]

    it.each(THEORY)("should convert $from.unit to $to.unit", ({ from, to }) => {
      // Act
      const converted = Distance.in(from, to.unit)

      // Asset
      expect(converted).toBeCloseTo(to.value, 12)
    })
  })

  describe("areEqual", () => {
    it.each([
      {
        distance1: Distance.create(5, UnitOfDistance.MILLIMETERS),
        distance2: Distance.create(10, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(5, UnitOfDistance.MILLIMETERS),
      },
      {
        distance1: Distance.create(5, UnitOfDistance.MILLIMETERS),
        distance2: Distance.create(10, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(10, UnitOfDistance.MILLIMETERS),
      },
      {
        distance1: Distance.create(1, UnitOfDistance.METERS),
        distance2: Distance.create(1005, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(5, UnitOfDistance.MILLIMETERS),
      },
    ])("should consider two distances equal if they are within tolerance (%o)", ({ distance1, distance2, tolerance }) => {
      // Act
      const areEqual = Distance.areEqual(distance1, distance2, tolerance)

      // Assert
      expect(areEqual).toBe(true)
    })

    it.each([
      {
        distance1: Distance.create(5, UnitOfDistance.MILLIMETERS),
        distance2: Distance.create(10, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(4.99999, UnitOfDistance.MILLIMETERS),
      },
      {
        distance1: Distance.create(5, UnitOfDistance.MILLIMETERS),
        distance2: Distance.create(10, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(2, UnitOfDistance.MILLIMETERS),
      },
      {
        distance1: Distance.create(1, UnitOfDistance.METERS),
        distance2: Distance.create(1005, UnitOfDistance.MILLIMETERS),
        tolerance: Distance.create(4.99999, UnitOfDistance.MILLIMETERS),
      },
    ])("should consider two distances not equal if they are outside of tolerance (%o)", ({ distance1, distance2, tolerance }) => {
      // Act
      const areEqual = Distance.areEqual(distance1, distance2, tolerance)

      // Assert
      expect(areEqual).toBe(false)
    })
  })

  describe("betweenSquared", () => {
    it.each([
      {
        description: "coincident points",
        position1: {
          x: Distance.create(1, UnitOfDistance.METERS),
          y: Distance.create(-2, UnitOfDistance.METERS),
          z: Distance.create(3, UnitOfDistance.METERS),
        },
        position2: {
          x: Distance.create(1, UnitOfDistance.METERS),
          y: Distance.create(-2, UnitOfDistance.METERS),
          z: Distance.create(3, UnitOfDistance.METERS),
        },
        unitOfReference: UnitOfDistance.METERS,
        expected: Distance.create(0, UnitOfDistance.METERS),
      },
      {
        description: "positive and negative coordinates on every axis",
        position1: {
          x: Distance.create(-1, UnitOfDistance.METERS),
          y: Distance.create(-2, UnitOfDistance.METERS),
          z: Distance.create(-3, UnitOfDistance.METERS),
        },
        position2: {
          x: Distance.create(2, UnitOfDistance.METERS),
          y: Distance.create(2, UnitOfDistance.METERS),
          z: Distance.create(9, UnitOfDistance.METERS),
        },
        unitOfReference: UnitOfDistance.METERS,
        expected: Distance.create(169, UnitOfDistance.METERS),
      },
      {
        description: "independently-unitized coordinates",
        position1: {
          x: Distance.create(0, UnitOfDistance.METERS),
          y: Distance.create(0, UnitOfDistance.MILLIMETERS),
          z: Distance.create(0, UnitOfDistance.ASTRONOMICAL_UNITS),
        },
        position2: {
          x: Distance.create(3_000, UnitOfDistance.MILLIMETERS),
          y: Distance.create(4, UnitOfDistance.METERS),
          z: Distance.create(12 / 149_597_870_700, UnitOfDistance.ASTRONOMICAL_UNITS),
        },
        unitOfReference: UnitOfDistance.METERS,
        expected: Distance.create(169, UnitOfDistance.METERS),
      },
    ])("should compute the squared distance for $description", ({ position1, position2, unitOfReference, expected }) => {
      // Act
      const distance = Distance.betweenSquared(position1, position2, unitOfReference)

      // Assert
      expect(distance.unit).toBe(expected.unit)
      expect(distance.value).toBeCloseTo(expected.value, 12)
    })

    it("should default to the first position's x-axis unit", () => {
      // Arrange
      const position1 = {
        x: Distance.create(0, UnitOfDistance.MILLIMETERS),
        y: Distance.create(0, UnitOfDistance.METERS),
        z: Distance.create(0, UnitOfDistance.METERS),
      }
      const position2 = {
        x: Distance.create(3, UnitOfDistance.METERS),
        y: Distance.create(4, UnitOfDistance.METERS),
        z: Distance.create(12, UnitOfDistance.METERS),
      }

      // Act
      const distance = Distance.betweenSquared(position1, position2)

      // Assert
      expect(distance).toStrictEqual(Distance.create(169_000_000, UnitOfDistance.MILLIMETERS))
    })

    it("should be symmetric and leave both positions untouched", () => {
      // Arrange
      const position1 = {
        x: Distance.create(1, UnitOfDistance.METERS),
        y: Distance.create(2_000, UnitOfDistance.MILLIMETERS),
        z: Distance.create(3, UnitOfDistance.METERS),
      }
      const position2 = {
        x: Distance.create(-2_000, UnitOfDistance.MILLIMETERS),
        y: Distance.create(6, UnitOfDistance.METERS),
        z: Distance.create(-9_000, UnitOfDistance.MILLIMETERS),
      }
      const originalPosition1 = structuredClone(position1)
      const originalPosition2 = structuredClone(position2)

      // Act
      const forward = Distance.betweenSquared(position1, position2, UnitOfDistance.METERS)
      const reverse = Distance.betweenSquared(position2, position1, UnitOfDistance.METERS)

      // Assert
      expect(forward).toStrictEqual(reverse)
      expect(position1).toStrictEqual(originalPosition1)
      expect(position2).toStrictEqual(originalPosition2)
    })
  })

  describe("between", () => {
    it.each([
      {
        description: "coincident points",
        position1: {
          x: Distance.create(1, UnitOfDistance.METERS),
          y: Distance.create(2, UnitOfDistance.METERS),
          z: Distance.create(3, UnitOfDistance.METERS),
        },
        position2: {
          x: Distance.create(1, UnitOfDistance.METERS),
          y: Distance.create(2, UnitOfDistance.METERS),
          z: Distance.create(3, UnitOfDistance.METERS),
        },
        unitOfReference: UnitOfDistance.METERS,
        expected: Distance.create(0, UnitOfDistance.METERS),
      },
      {
        description: "a three-dimensional displacement",
        position1: {
          x: Distance.create(-1, UnitOfDistance.METERS),
          y: Distance.create(-2, UnitOfDistance.METERS),
          z: Distance.create(-3, UnitOfDistance.METERS),
        },
        position2: {
          x: Distance.create(2, UnitOfDistance.METERS),
          y: Distance.create(2, UnitOfDistance.METERS),
          z: Distance.create(9, UnitOfDistance.METERS),
        },
        unitOfReference: UnitOfDistance.METERS,
        expected: Distance.create(13, UnitOfDistance.METERS),
      },
      {
        description: "mixed units with an explicit millimeter reference",
        position1: {
          x: Distance.create(0, UnitOfDistance.METERS),
          y: Distance.create(0, UnitOfDistance.MILLIMETERS),
          z: Distance.create(0, UnitOfDistance.METERS),
        },
        position2: {
          x: Distance.create(3, UnitOfDistance.METERS),
          y: Distance.create(4_000, UnitOfDistance.MILLIMETERS),
          z: Distance.create(12, UnitOfDistance.METERS),
        },
        unitOfReference: UnitOfDistance.MILLIMETERS,
        expected: Distance.create(13_000, UnitOfDistance.MILLIMETERS),
      },
    ])("should compute the distance for $description", ({ position1, position2, unitOfReference, expected }) => {
      // Act
      const distance = Distance.between(position1, position2, unitOfReference)

      // Assert
      expect(distance.unit).toBe(expected.unit)
      expect(distance.value).toBeCloseTo(expected.value, 12)
    })

    it("should default to the first position's x-axis unit and be symmetric for a fixed reference unit", () => {
      // Arrange
      const position1 = {
        x: Distance.create(0, UnitOfDistance.MILLIMETERS),
        y: Distance.create(0, UnitOfDistance.METERS),
        z: Distance.create(0, UnitOfDistance.METERS),
      }
      const position2 = {
        x: Distance.create(3, UnitOfDistance.METERS),
        y: Distance.create(4, UnitOfDistance.METERS),
        z: Distance.create(12, UnitOfDistance.METERS),
      }

      // Act
      const defaultDistance = Distance.between(position1, position2)
      const reverseDistance = Distance.between(position2, position1, UnitOfDistance.MILLIMETERS)

      // Assert
      expect(defaultDistance).toStrictEqual(Distance.create(13_000, UnitOfDistance.MILLIMETERS))
      expect(reverseDistance).toStrictEqual(defaultDistance)
    })
  })
})
