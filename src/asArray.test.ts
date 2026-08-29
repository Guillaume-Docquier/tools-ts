import { describe, it, expect, expectTypeOf } from "vitest"
import { asArray } from "./asArray.js"

describe("asArray", () => {
  it("should return an array when given a value", () => {
    // Arrange
    const thing = 1

    // Act
    const things = asArray(thing)

    // Assert
    expect(things).toStrictEqual([thing])
    expectTypeOf(things).toEqualTypeOf<number[]>()
  })

  it("should return the array as in when given an array", () => {
    // Arrange
    const thing = [1]

    // Act
    const things = asArray(thing)

    // Assert
    expect(things).toBe(thing)
    expectTypeOf(things).toEqualTypeOf<number[]>()
  })
})
