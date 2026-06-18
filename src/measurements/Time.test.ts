import { describe, it, expect } from "vitest"
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
      expect(time).toEqual<typeof time>({ value, unit })
    })
  })

  const PRECISION = 7
  const THEORY = [
    { from: { value: 2500, unit: UnitOfTime.SECONDS }, to: { value: 2500, unit: UnitOfTime.SECONDS } },
    { from: { value: 2500, unit: UnitOfTime.SECONDS }, to: { value: 41.6666667, unit: UnitOfTime.MINUTES } },
    { from: { value: 2500, unit: UnitOfTime.SECONDS }, to: { value: 0.6944444, unit: UnitOfTime.HOURS } },
    { from: { value: 2500, unit: UnitOfTime.MINUTES }, to: { value: 150000, unit: UnitOfTime.SECONDS } },
    { from: { value: 2500, unit: UnitOfTime.MINUTES }, to: { value: 2500, unit: UnitOfTime.MINUTES } },
    { from: { value: 2500, unit: UnitOfTime.MINUTES }, to: { value: 41.6666667, unit: UnitOfTime.HOURS } },
    { from: { value: 2500, unit: UnitOfTime.HOURS }, to: { value: 9000000, unit: UnitOfTime.SECONDS } },
    { from: { value: 2500, unit: UnitOfTime.HOURS }, to: { value: 150000, unit: UnitOfTime.MINUTES } },
    { from: { value: 2500, unit: UnitOfTime.HOURS }, to: { value: 2500, unit: UnitOfTime.HOURS } },
  ]

  describe("convert", () => {
    it.each(THEORY)("should convert $from.unit to $to.unit", ({ from, to }) => {
      // Act
      const converted = Time.convert(from, to.unit)

      // Asset
      expect(converted.value).toBeCloseTo(to.value, PRECISION)
      expect(converted.unit).toEqual(to.unit)
    })
  })

  describe("in", () => {
    it.each(THEORY)("should convert $from.unit to $to.unit", ({ from, to }) => {
      // Act
      const converted = Time.in(from, to.unit)

      // Asset
      expect(converted).toBeCloseTo(to.value, PRECISION)
    })
  })
})
