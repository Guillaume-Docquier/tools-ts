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
})
