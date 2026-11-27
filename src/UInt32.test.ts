import { describe, expect, it, vi } from "vitest"
import { UInt32 } from "./UInt32.js"

describe("UInt32", () => {
  describe("validate", () => {
    it.each([
      { value: 0, expected: true },
      { value: 42, expected: true },
      { value: 0xffffffff, expected: true },
      { value: -1, expected: false },
      { value: 0x100000000, expected: false },
      { value: 1.5, expected: false },
      { value: Number.NaN, expected: false },
      { value: Number.POSITIVE_INFINITY, expected: false },
    ])("should validate $value as $expected", (theory) => {
      // Arrange
      const { value, expected } = theory

      // Act
      const result = UInt32.validate(value)

      // Assert
      expect(result).toBe(expected)
    })
  })

  describe("random", () => {
    it.each([
      { sample: 0, expected: 0 },
      { sample: 0.5, expected: 0x80000000 },
      { sample: 1 - Number.EPSILON / 2, expected: 0xffffffff },
    ])("should generate $expected for a random sample of $sample", ({ sample, expected }) => {
      // Arrange
      vi.spyOn(Math, "random").mockReturnValue(sample)

      // Act
      const result = UInt32.random()

      // Assert
      expect(result).toBe(expected)
    })
  })
})
