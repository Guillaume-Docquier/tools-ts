import { describe, expect, it } from "vitest"
import { Scalar } from "./Scalar.js"

describe("Scalar", () => {
  describe("clamp", () => {
    it.each([
      { value: -1, min: 0, max: 10, expected: 0 },
      { value: 0, min: 0, max: 10, expected: 0 },
      { value: 4.5, min: 0, max: 10, expected: 4.5 },
      { value: 10, min: 0, max: 10, expected: 10 },
      { value: 11, min: 0, max: 10, expected: 10 },
    ])("should clamp $value to [$min, $max] as $expected", (theory) => {
      // Arrange
      const { value, min, max, expected } = theory

      // Act
      const result = Scalar.clamp(value, min, max)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
