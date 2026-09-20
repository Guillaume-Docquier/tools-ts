import { describe, expect, expectTypeOf, it } from "vitest"
import { Time, UnitOfTime } from "./Time.js"

describe("Time", () => {
  describe("create", () => {
    it("should create a Time", () => {
      // Arrange
      const value = 1
      const unit = UnitOfTime.MILLISECONDS

      // Act
      const time = Time.create(value, unit)

      // Assert
      expect(time).toStrictEqual<typeof time>({ value, unit })
    })

    it("should infer the created time's unit", () => {
      // Arrange
      const value = 1
      const unit = UnitOfTime.MINUTES

      // Act
      const time = Time.create(value, unit)

      // Assert
      expectTypeOf(time).toEqualTypeOf<Time<UnitOfTime.MINUTES>>()
    })
  })

  const PRECISION = 7
  const CONVERSIONS_THEORY = [
    { from: Time.create(2500, UnitOfTime.SECONDS), to: Time.create(2500, UnitOfTime.SECONDS) },
    { from: Time.create(2500, UnitOfTime.SECONDS), to: Time.create(41.6666667, UnitOfTime.MINUTES) },
    { from: Time.create(2500, UnitOfTime.SECONDS), to: Time.create(0.6944444, UnitOfTime.HOURS) },
    { from: Time.create(2500, UnitOfTime.SECONDS), to: Time.create(0.0289352, UnitOfTime.DAYS) },
    { from: Time.create(2500, UnitOfTime.MINUTES), to: Time.create(150000, UnitOfTime.SECONDS) },
    { from: Time.create(2500, UnitOfTime.MINUTES), to: Time.create(2500, UnitOfTime.MINUTES) },
    { from: Time.create(2500, UnitOfTime.MINUTES), to: Time.create(41.6666667, UnitOfTime.HOURS) },
    { from: Time.create(2500, UnitOfTime.HOURS), to: Time.create(9000000, UnitOfTime.SECONDS) },
    { from: Time.create(2500, UnitOfTime.HOURS), to: Time.create(150000, UnitOfTime.MINUTES) },
    { from: Time.create(2500, UnitOfTime.HOURS), to: Time.create(2500, UnitOfTime.HOURS) },
    { from: Time.create(2500, UnitOfTime.HOURS), to: Time.create(104.1666667, UnitOfTime.DAYS) },
  ]

  describe("convert", () => {
    it.each(CONVERSIONS_THEORY)("should convert $from.unit to $to.unit", ({ from, to }) => {
      // Act
      const converted = Time.convert(from, to.unit)

      // Asset
      expect(converted.value).toBeCloseTo(to.value, PRECISION)
      expect(converted.unit).toStrictEqual(to.unit)
    })
  })

  describe("in", () => {
    it.each(CONVERSIONS_THEORY)("should convert $from.unit to $to.unit", ({ from, to }) => {
      // Act
      const converted = Time.in(from, to.unit)

      // Asset
      expect(converted).toBeCloseTo(to.value, PRECISION)
    })
  })

  describe("add", () => {
    it.each([
      {
        timeA: Time.create(2, UnitOfTime.SECONDS),
        timeB: Time.create(3, UnitOfTime.SECONDS),
        expected: Time.create(5, UnitOfTime.SECONDS),
      },
      {
        timeA: Time.create(1, UnitOfTime.SECONDS),
        timeB: Time.create(500, UnitOfTime.MILLISECONDS),
        expected: Time.create(1.5, UnitOfTime.SECONDS),
      },
      {
        timeA: Time.create(2, UnitOfTime.MINUTES),
        timeB: Time.create(30, UnitOfTime.SECONDS),
        expected: Time.create(2.5, UnitOfTime.MINUTES),
      },
      {
        timeA: Time.create(500, UnitOfTime.MILLISECONDS),
        timeB: Time.create(2, UnitOfTime.SECONDS),
        expected: Time.create(2500, UnitOfTime.MILLISECONDS),
      },
      {
        timeA: Time.create(1.5, UnitOfTime.HOURS),
        timeB: Time.create(30, UnitOfTime.MINUTES),
        expected: Time.create(2, UnitOfTime.HOURS),
      },
    ])("should add $timeA.unit and $timeB.unit as $expected.unit", ({ timeA, timeB, expected }) => {
      // Act
      const added = Time.add(timeA, timeB)

      // Assert
      expect(added.value).toBeCloseTo(expected.value, PRECISION)
      expect(added.unit).toStrictEqual(expected.unit)
    })
  })

  describe("subtract", () => {
    it.each([
      {
        timeA: Time.create(5, UnitOfTime.SECONDS),
        timeB: Time.create(3, UnitOfTime.SECONDS),
        expected: Time.create(2, UnitOfTime.SECONDS),
      },
      {
        timeA: Time.create(1.5, UnitOfTime.SECONDS),
        timeB: Time.create(500, UnitOfTime.MILLISECONDS),
        expected: Time.create(1, UnitOfTime.SECONDS),
      },
      {
        timeA: Time.create(2, UnitOfTime.MINUTES),
        timeB: Time.create(30, UnitOfTime.SECONDS),
        expected: Time.create(1.5, UnitOfTime.MINUTES),
      },
      {
        timeA: Time.create(2500, UnitOfTime.MILLISECONDS),
        timeB: Time.create(2, UnitOfTime.SECONDS),
        expected: Time.create(500, UnitOfTime.MILLISECONDS),
      },
      {
        timeA: Time.create(2, UnitOfTime.HOURS),
        timeB: Time.create(30, UnitOfTime.MINUTES),
        expected: Time.create(1.5, UnitOfTime.HOURS),
      },
    ])("should subtract $timeB.unit from $timeA.unit as $expected.unit", ({ timeA, timeB, expected }) => {
      // Act
      const subtracted = Time.subtract(timeA, timeB)

      // Assert
      expect(subtracted.value).toBeCloseTo(expected.value, PRECISION)
      expect(subtracted.unit).toStrictEqual(expected.unit)
    })
  })
})
