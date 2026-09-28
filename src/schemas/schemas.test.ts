import { describe, expect, it } from "vitest"
import { IntegerSchema, PositiveNumberSchema } from "../entry.schemas.js"

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
})
