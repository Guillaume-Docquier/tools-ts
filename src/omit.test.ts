import { describe, expect, expectTypeOf, it } from "vitest"
import { omit } from "./omit.js"

describe("omit", () => {
  it("should return the record without the omitted key", () => {
    // Arrange
    const record = { a: 1, b: "two", c: true }

    // Act
    const omitted = omit(record, "b")

    // Assert
    expect(omitted).toEqual({ a: 1, c: true })
    expectTypeOf(omitted).toEqualTypeOf<Omit<typeof record, "b">>()
  })

  it("should return the record without multiple omitted keys", () => {
    // Arrange
    const record = { a: 1, b: "two", c: true, d: null }

    // Act
    const omitted = omit(record, "b", "d")

    // Assert
    expect(omitted).toEqual({ a: 1, c: true })
    expectTypeOf(omitted).toEqualTypeOf<Omit<typeof record, "b" | "d">>()
  })

  it("should not mutate the original record", () => {
    // Arrange
    const record = { a: 1, b: "two", c: true }

    // Act
    const omitted = omit(record, "b")

    // Assert
    expect(record).toEqual({ a: 1, b: "two", c: true })
    expect(omitted).not.toBe(record)
  })

  it("should return a shallow copy when no keys are omitted", () => {
    // Arrange
    const record = { a: 1, b: "two" }

    // Act
    const omitted = omit(record)

    // Assert
    expect(omitted).toEqual(record)
    expect(omitted).not.toBe(record)
  })

  it("should only allow keys from the record", () => {
    const record = { a: 1, b: "two" }

    // @ts-expect-error -- c is not a key of record
    omit(record, "c")
  })
})
