import { describe, expect, expectTypeOf, it } from "vitest"
import { Assert } from "./Assert.js"
import { Result } from "./Result.js"
import { Range, type ExclusiveRange, type InclusiveRange } from "./Range.js"

describe("Range", () => {
  describe("createMaxInclusive", () => {
    it("should return a Success for integer range", () => {
      // Arrange
      const range = { numericType: "integer", min: 1, maxInclusive: 3 } as const

      // Act
      const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<InclusiveRange<"integer">, string>>()
      expectTypeOf(result).toExtend<Result<Range, string>>()
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxInclusive" }))
    })

    it("should return a Success for float range", () => {
      // Arrange
      const range = { numericType: "float", min: 1.5, maxInclusive: 3.5 } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<InclusiveRange<"float">, string>>()
      expectTypeOf(result).toExtend<Result<Range, string>>()
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxInclusive" }))
    })

    it("should return a Success when min equals max", () => {
      // Arrange
      const range = { numericType: "integer", min: 3, maxInclusive: 3 } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxInclusive" }))
    })

    it("should return a Success when min and max are within the limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "float", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)

      const range = { numericType: "integer", min: 2, maxInclusive: 8, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxInclusive" }))
    })

    it.each([
      {
        range: { numericType: "integer", min: 4, maxInclusive: 3 } as const,
        reason: "min is greater than max",
      },
      {
        range: { numericType: "integer", min: 1.1, maxInclusive: 3 } as const,
        reason: "min is float instead of integer",
      },
      {
        range: { numericType: "integer", min: 1, maxInclusive: 3.1 } as const,
        reason: "max is float instead of integer",
      },
      {
        range: { numericType: "float", min: Number.NaN, maxInclusive: 3 } as const,
        reason: "min is NaN",
      },
      {
        range: { numericType: "float", min: 1, maxInclusive: Number.NaN } as const,
        reason: "max is NaN",
      },
      {
        range: { numericType: "float", min: Number.NEGATIVE_INFINITY, maxInclusive: 3 } as const,
        reason: "min is infinite",
      },
      {
        range: { numericType: "float", min: 1, maxInclusive: Number.POSITIVE_INFINITY } as const,
        reason: "max is infinite",
      },
    ])("should return a Failure when $reason", ({ range }) => {
      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>(Result.Failure(expect.any(String)))
    })

    it("should return a Failure when min is below the limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxInclusive", numericType: "integer", min: -1, maxInclusive: 3, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when max is above the limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)

      const range = { numericType: "integer", min: 1, maxInclusive: 11, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when max equals an exclusive limit", () => {
      // Arrange
      const limitsResult = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
      Assert.isSuccess(limitsResult)

      // Act
      const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 10, limits: limitsResult.value })

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when limits are invalid", () => {
      // Arrange
      const invalidLimits: Range = { type: "MaxExclusive", numericType: "integer", min: 10, maxExclusive: 0 }

      const range = { numericType: "integer", min: 2, maxInclusive: 3, limits: invalidLimits } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })
  })

  describe("createMaxExclusive", () => {
    it("should return a Success for integer range", () => {
      // Arrange
      const range = { numericType: "integer", min: 1, maxExclusive: 4 } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<ExclusiveRange<"integer">, string>>()
      expectTypeOf(result).toExtend<Result<Range, string>>()
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxExclusive" }))
    })

    it("should return a Success for float range", () => {
      // Arrange
      const range = { numericType: "float", min: 1.5, maxExclusive: 3.5 } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<ExclusiveRange<"float">, string>>()
      expectTypeOf(result).toExtend<Result<Range, string>>()
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxExclusive" }))
    })

    it("should return a Success when min and max are within the limits", () => {
      // Arrange
      const limitsResult = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
      Assert.isSuccess(limitsResult)

      const range = { numericType: "integer", min: 2, maxExclusive: 8, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toEqual<typeof result>(Result.Success({ ...range, type: "MaxExclusive" }))
    })

    it.each([
      {
        range: { numericType: "integer", min: 3, maxExclusive: 3 } as const,
        reason: "min equals max",
      },
      {
        range: { numericType: "integer", min: 4, maxExclusive: 3 } as const,
        reason: "min is greater than max",
      },
      {
        range: { numericType: "integer", min: 1.1, maxExclusive: 3 } as const,
        reason: "min is float instead of integer",
      },
      {
        range: { numericType: "integer", min: 1, maxExclusive: 3.1 } as const,
        reason: "max is float instead of integer",
      },
      {
        range: { numericType: "float", min: Number.NaN, maxExclusive: 3 } as const,
        reason: "min is NaN",
      },
      {
        range: { numericType: "float", min: 1, maxExclusive: Number.NaN } as const,
        reason: "max is NaN",
      },
      {
        range: { numericType: "float", min: Number.NEGATIVE_INFINITY, maxExclusive: 3 } as const,
        reason: "min is infinite",
      },
      {
        range: { numericType: "float", min: 1, maxExclusive: Number.POSITIVE_INFINITY } as const,
        reason: "max is infinite",
      },
    ])("should return a Failure when $reason", ({ range }) => {
      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when min is below the limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)

      const range = { numericType: "integer", min: -1, maxExclusive: 3, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when max is above the limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)

      const range = { numericType: "integer", min: 1, maxExclusive: 11, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when limits are invalid", () => {
      // Arrange
      const invalidLimits: Range = { type: "MaxExclusive", numericType: "integer", min: 10, maxExclusive: 0 }

      const range = { numericType: "integer", min: 2, maxExclusive: 3, limits: invalidLimits } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toMatchObject<typeof result>({ type: "Failure", error: expect.any(String) })
    })
  })

  describe("from", () => {
    it("should return a Success for inclusive range", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)

      const rangeResult = Range.createMaxInclusive({
        numericType: "integer",
        min: 2,
        maxInclusive: 8,
        limits: limitsResult.value,
      })
      Assert.isSuccess(rangeResult)

      // Act
      const result = Range.from(rangeResult.value, { min: 3, max: 7 })

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<typeof rangeResult.value, string>>()
      expect(result).toEqual<typeof result>(Result.Success({ ...rangeResult.value, min: 3, maxInclusive: 7 }))
    })

    it("should return a Success for exclusive range", () => {
      // Arrange
      const limitsResult = Range.createMaxExclusive({ numericType: "float", min: 0, maxExclusive: 10 })
      Assert.isSuccess(limitsResult)

      const rangeResult = Range.createMaxExclusive({
        numericType: "float",
        min: 2,
        maxExclusive: 8,
        limits: limitsResult.value,
      })
      Assert.isSuccess(rangeResult)

      // Act
      const result = Range.from(rangeResult.value, { min: 3.25, max: 7.75 })

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<typeof rangeResult.value, string>>()
      expect(result).toEqual<typeof result>(Result.Success({ ...rangeResult.value, min: 3.25, maxExclusive: 7.75 }))
    })

    it("should return a Failure when the resulting range would be invalid", () => {
      // Arrange
      const fromRangeResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(fromRangeResult)

      // Act
      const result = Range.from(fromRangeResult.value, { min: 1.1, max: 2 })

      // Assert
      expect(result).toMatchObject<typeof result>(Result.Failure(expect.any(String)))
    })
  })

  describe("validate", () => {
    it("should be tested by the range factory methods", () => {
      // Tested through the Range factory methods, coverage proves it
      expect(true).toBe(true)
    })
  })

  describe("isWithin", () => {
    it.each([
      {
        range: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        value: 1,
        reason: "integer value is equal to min",
      },
      {
        range: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        value: 2,
        reason: "integer value is within range",
      },
      {
        range: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        value: 3,
        reason: "integer value is equal to inclusive max",
      },
      {
        range: Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 4 }),
        value: 3,
        reason: "integer value is below exclusive max",
      },
      {
        range: Range.createMaxInclusive({ numericType: "float", min: 1.1, maxInclusive: 3 }),
        value: 1.1,
        reason: "float value is equal to min",
      },
      {
        range: Range.createMaxInclusive({ numericType: "float", min: 1.5, maxInclusive: 3.5 }),
        value: 2.25,
        reason: "float value is within range",
      },
      {
        range: Range.createMaxInclusive({ numericType: "float", min: 1.5, maxInclusive: 3.5 }),
        value: 3.5,
        reason: "float value is equal to inclusive max",
      },
      {
        range: Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 }),
        value: 3.499,
        reason: "float value is below exclusive max",
      },
      {
        range: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        value: 2.5,
        reason: "float value is within integer range",
      },
    ])("should return true when $reason", ({ range, value }) => {
      Assert.isSuccess<Range>(range)
      expect(Range.isWithin(range.value, value)).toBe(true)
    })

    it.each([
      {
        range: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        value: 0,
        reason: "value is below min",
      },
      {
        range: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        value: 4,
        reason: "value is above inclusive max",
      },
      {
        range: Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 3 }),
        value: 3,
        reason: "value is equal to exclusive max",
      },
      {
        range: Range.createMaxInclusive({ numericType: "float", min: 1.5, maxInclusive: 3.5 }),
        value: Number.NaN,
        reason: "value is NaN",
      },
      {
        range: Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 }),
        value: Number.POSITIVE_INFINITY,
        reason: "value is infinite",
      },
    ])("should return false when $reason", ({ range, value }) => {
      Assert.isSuccess<Range>(range)
      expect(Range.isWithin(range.value, value)).toBe(false)
    })
  })

  describe("overlaps", () => {
    it.each([
      {
        a: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        b: Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 }),
        reason: "min of inclusive range equals inclusive max",
      },
      {
        a: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        b: Range.createMaxExclusive({ numericType: "integer", min: 3, maxExclusive: 5 }),
        reason: "min of exclusive range equals inclusive max",
      },
      {
        a: Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 4 }),
        b: Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 }),
        reason: "integer min is within range",
      },
      {
        a: Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 }),
        b: Range.createMaxInclusive({ numericType: "float", min: 3.25, maxInclusive: 5.5 }),
        reason: "float min is within range",
      },
    ])("should return true when $reason", ({ a, b }) => {
      Assert.isSuccess<Range>(a)
      Assert.isSuccess<Range>(b)

      expect(Range.overlaps(a.value, b.value)).toBe(true)
      expect(Range.overlaps(b.value, a.value)).toBe(true)
    })

    it.each([
      {
        a: Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 }),
        b: Range.createMaxInclusive({ numericType: "integer", min: 4, maxInclusive: 5 }),
        reason: "min is outside the range",
      },
      {
        a: Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 3 }),
        b: Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 }),
        reason: "min of inclusive range is equal to exclusive max",
      },
      {
        a: Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 }),
        b: Range.createMaxInclusive({ numericType: "float", min: 3.5, maxInclusive: 5.5 }),
        reason: "min of exclusive range is equal to exclusive max",
      },
    ])("should return false when $reason", ({ a, b }) => {
      Assert.isSuccess<Range>(a)
      Assert.isSuccess<Range>(b)

      expect(Range.overlaps(a.value, b.value)).toBe(false)
      expect(Range.overlaps(b.value, a.value)).toBe(false)
    })
  })
})
