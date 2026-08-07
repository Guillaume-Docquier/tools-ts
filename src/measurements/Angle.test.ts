import { describe, expect, it } from "vitest"
import { Angle, UnitOfAngle } from "./Angle.js"

describe("Angle", () => {
  describe("create", () => {
    it("should create an angle with its unit", () => {
      expect(Angle.create(90, UnitOfAngle.DEGREES)).toEqual({
        value: 90,
        unit: UnitOfAngle.DEGREES,
      })
    })
  })

  describe("convert", () => {
    it.each([
      { from: Angle.create(180, UnitOfAngle.DEGREES), to: Angle.create(Math.PI, UnitOfAngle.RADIANS) },
      { from: Angle.create(Math.PI / 2, UnitOfAngle.RADIANS), to: Angle.create(90, UnitOfAngle.DEGREES) },
      { from: Angle.create(-45, UnitOfAngle.DEGREES), to: Angle.create(-Math.PI / 4, UnitOfAngle.RADIANS) },
      { from: Angle.create(2.5, UnitOfAngle.RADIANS), to: Angle.create(2.5, UnitOfAngle.RADIANS) },
    ])("should convert $from.unit to $to.unit", ({ from, to }) => {
      const converted = Angle.convert(from, to.unit)

      expect(converted.unit).toBe(to.unit)
      expect(converted.value).toBeCloseTo(to.value, 12)
      expect(from).not.toBe(converted)
    })
  })

  describe("in", () => {
    it.each([
      { angle: Angle.create(360, UnitOfAngle.DEGREES), unit: UnitOfAngle.RADIANS, expected: 2 * Math.PI },
      { angle: Angle.create(Math.PI, UnitOfAngle.RADIANS), unit: UnitOfAngle.DEGREES, expected: 180 },
      { angle: Angle.create(45, UnitOfAngle.DEGREES), unit: UnitOfAngle.DEGREES, expected: 45 },
    ])("should return $angle.unit in $unit", ({ angle, unit, expected }) => {
      expect(Angle.in(angle, unit)).toBeCloseTo(expected, 12)
    })
  })
})
