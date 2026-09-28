import { describe, expect, it } from "vitest"
import {
  IntegerSchema,
  NegativeNumberSchema,
  NonNegativeNumberSchema,
  NonPositiveNumberSchema,
  PositiveNumberSchema,
} from "../entry.schemas.js"

describe("number schemas", () => {
  it("should parse whole numbers, including zero and negatives", () => {
    // Arrange
    const values = [-2, 0, 3]

    // Act
    const parsed = values.map((value) => IntegerSchema.parse(value))

    // Assert
    expect(parsed).toStrictEqual(values)
    expect(IntegerSchema.safeParse(0.5).success).toBe(false)
  })

  it("should parse positive numbers, including fractions", () => {
    // Arrange
    const values = [0.5, 2]

    // Act
    const parsed = values.map((value) => PositiveNumberSchema.parse(value))

    // Assert
    expect(parsed).toStrictEqual(values)
    expect(PositiveNumberSchema.safeParse(0).success).toBe(false)
    expect(PositiveNumberSchema.safeParse(-1).success).toBe(false)
  })

  it("should parse non-negative numbers, including zero and fractions", () => {
    // Arrange
    const values = [0, 0.5, 2]

    // Act
    const parsed = values.map((value) => NonNegativeNumberSchema.parse(value))

    // Assert
    expect(parsed).toStrictEqual(values)
    expect(NonNegativeNumberSchema.safeParse(-0.5).success).toBe(false)
  })

  it("should parse negative numbers, including fractions", () => {
    // Arrange
    const values = [-2, -0.5]

    // Act
    const parsed = values.map((value) => NegativeNumberSchema.parse(value))

    // Assert
    expect(parsed).toStrictEqual(values)
    expect(NegativeNumberSchema.safeParse(0).success).toBe(false)
    expect(NegativeNumberSchema.safeParse(0.5).success).toBe(false)
  })

  it("should parse non-positive numbers, including zero and fractions", () => {
    // Arrange
    const values = [-2, -0.5, 0]

    // Act
    const parsed = values.map((value) => NonPositiveNumberSchema.parse(value))

    // Assert
    expect(parsed).toStrictEqual(values)
    expect(NonPositiveNumberSchema.safeParse(0.5).success).toBe(false)
  })
})
