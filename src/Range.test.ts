import { describe, expect, expectTypeOf, it } from "vitest"
import { Assert } from "./Assert.js"
import { Result, type Failure } from "./Result.js"
import { Range, type ExclusiveRange, type InclusiveRange, type Range as RangeType } from "./Range.js"

expectTypeOf<InclusiveRange<"integer">>().toExtend<RangeType<"integer">>()
expectTypeOf<ExclusiveRange<"integer">>().toExtend<RangeType<"integer">>()
expectTypeOf<RangeType<"integer">>().toEqualTypeOf<InclusiveRange<"integer"> | ExclusiveRange<"integer">>()
expectTypeOf<RangeType<"float">>().toEqualTypeOf<InclusiveRange<"float"> | ExclusiveRange<"float">>()
expectTypeOf<InclusiveRange<"integer">>().not.toExtend<RangeType<"float">>()
expectTypeOf<ExclusiveRange<"float">>().not.toExtend<RangeType<"integer">>()

describe("Range", () => {
  describe("createMaxInclusive", () => {
    it("should return a Success containing a MaxInclusive integer range", () => {
      // Arrange
      const range = { numericType: "integer", min: 1, maxInclusive: 3 } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<InclusiveRange<"integer">, string>>()
      expect(result).toEqual<typeof result>(
        Result.Success({
          type: "MaxInclusive",
          ...range,
        }),
      )
    })

    it("should return a Success containing a MaxInclusive float range", () => {
      // Arrange
      const range = { type: "MaxInclusive", numericType: "float", min: 1.5, maxInclusive: 3.5 } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<InclusiveRange<"float">, string>>()
      expect(result).toEqual<typeof result>(Result.Success(range))
    })

    it("should allow an inclusive range whose min equals its maxInclusive", () => {
      // Arrange
      const range = { type: "MaxInclusive", numericType: "integer", min: 3, maxInclusive: 3 } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toEqual<typeof result>(Result.Success(range))
    })

    it("should keep the limits when the range is within them", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxInclusive", numericType: "integer", min: 2, maxInclusive: 8, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toEqual<typeof result>(Result.Success(range))
    })

    it.each([
      {
        range: { type: "MaxInclusive", numericType: "integer", min: 4, maxInclusive: 3 } as const,
        reason: "min greater than maxInclusive",
      },
      { range: { type: "MaxInclusive", numericType: "integer", min: 1.1, maxInclusive: 3 } as const, reason: "decimal integer min" },
      {
        range: { type: "MaxInclusive", numericType: "integer", min: 1, maxInclusive: 3.1 } as const,
        reason: "decimal integer maxInclusive",
      },
      { range: { type: "MaxInclusive", numericType: "integer", min: Number.NaN, maxInclusive: 3 } as const, reason: "NaN min" },
      { range: { type: "MaxInclusive", numericType: "integer", min: 1, maxInclusive: Number.NaN } as const, reason: "NaN maxInclusive" },
      {
        range: { type: "MaxInclusive", numericType: "float", min: Number.NEGATIVE_INFINITY, maxInclusive: 3 } as const,
        reason: "infinite min",
      },
      {
        range: { type: "MaxInclusive", numericType: "float", min: 1, maxInclusive: Number.POSITIVE_INFINITY } as const,
        reason: "infinite maxInclusive",
      },
    ])("should return a Failure when the inclusive range is invalid because of $reason", ({ range }) => {
      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expectTypeOf(result).toExtend<Result<InclusiveRange<"integer" | "float">, string>>()
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when the inclusive range minimum is below its limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxInclusive", numericType: "integer", min: -1, maxInclusive: 3, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when the inclusive range maximum is above its limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxInclusive", numericType: "integer", min: 1, maxInclusive: 11, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxInclusive(range)

      // Assert
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when the inclusive range maximum equals an exclusive limit", () => {
      // Arrange
      const limitsResult = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
      Assert.isSuccess(limitsResult)

      // Act
      const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 10, limits: limitsResult.value })

      // Assert
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })
  })

  describe("createMaxExclusive", () => {
    it("should return a Success containing a MaxExclusive integer range", () => {
      // Arrange
      const range = { type: "MaxExclusive", numericType: "integer", min: 1, maxExclusive: 4 } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<ExclusiveRange<"integer">, string>>()
      expect(result).toEqual<typeof result>(Result.Success(range))
    })

    it("should return a Success containing a MaxExclusive float range", () => {
      // Arrange
      const range = { type: "MaxExclusive", numericType: "float", min: 1.5, maxExclusive: 3.5 } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<ExclusiveRange<"float">, string>>()
      expect(result).toEqual<typeof result>(Result.Success(range))
    })

    it("should keep the limits when the range is within them", () => {
      // Arrange
      const limitsResult = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxExclusive", numericType: "integer", min: 2, maxExclusive: 8, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toEqual<typeof result>(Result.Success(range))
    })

    it.each([
      { range: { type: "MaxExclusive", numericType: "integer", min: 3, maxExclusive: 3 } as const, reason: "min equal to maxExclusive" },
      {
        range: { type: "MaxExclusive", numericType: "integer", min: 4, maxExclusive: 3 } as const,
        reason: "min greater than maxExclusive",
      },
      { range: { type: "MaxExclusive", numericType: "integer", min: 1.1, maxExclusive: 3 } as const, reason: "decimal integer min" },
      {
        range: { type: "MaxExclusive", numericType: "integer", min: 1, maxExclusive: 3.1 } as const,
        reason: "decimal integer maxExclusive",
      },
      { range: { type: "MaxExclusive", numericType: "float", min: Number.NaN, maxExclusive: 3 } as const, reason: "NaN min" },
      { range: { type: "MaxExclusive", numericType: "float", min: 1, maxExclusive: Number.NaN } as const, reason: "NaN maxExclusive" },
      {
        range: { type: "MaxExclusive", numericType: "float", min: Number.NEGATIVE_INFINITY, maxExclusive: 3 } as const,
        reason: "infinite min",
      },
      {
        range: { type: "MaxExclusive", numericType: "float", min: 1, maxExclusive: Number.POSITIVE_INFINITY } as const,
        reason: "infinite maxExclusive",
      },
    ])("should return a Failure when the exclusive range is invalid because of $reason", ({ range }) => {
      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expectTypeOf(result).toExtend<Result<ExclusiveRange<"integer" | "float">, string>>()
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when the exclusive range minimum is below its limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxExclusive", numericType: "integer", min: -1, maxExclusive: 3, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })

    it("should return a Failure when the exclusive range maximum is above its limits", () => {
      // Arrange
      const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
      Assert.isSuccess(limitsResult)
      const range = { type: "MaxExclusive", numericType: "integer", min: 1, maxExclusive: 11, limits: limitsResult.value } as const

      // Act
      const result = Range.createMaxExclusive(range)

      // Assert
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })
  })

  describe("from", () => {
    it("should create a new inclusive range with the same numeric type and limits", () => {
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

      const expectedRangeResult = Range.createMaxInclusive({
        numericType: "integer",
        min: 3,
        maxInclusive: 7,
        limits: limitsResult.value,
      })
      Assert.isSuccess(expectedRangeResult)

      // Act
      const result = Range.from(rangeResult.value, { min: 3, max: 7 })

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<InclusiveRange<"integer">, string>>()
      expect(result).toEqual<typeof result>(Result.Success(expectedRangeResult.value))
    })

    it("should create a new exclusive range with the same numeric type and limits", () => {
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

      const expectedRangeResult = Range.createMaxExclusive({
        numericType: "float",
        min: 3.25,
        maxExclusive: 7.75,
        limits: limitsResult.value,
      })
      Assert.isSuccess(expectedRangeResult)

      // Act
      const result = Range.from(rangeResult.value, { min: 3.25, max: 7.75 })

      // Assert
      expectTypeOf(result).toEqualTypeOf<Result<ExclusiveRange<"float">, string>>()
      expect(result).toEqual<typeof result>(Result.Success(expectedRangeResult.value))
    })

    it.each([
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
          Assert.isSuccess(result)
          return result.value
        },
        withValues: { min: 4, max: 3 },
        reason: "invalid inclusive bounds",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
          Assert.isSuccess(result)
          return result.value
        },
        withValues: { min: 3, max: 3 },
        reason: "invalid exclusive bounds",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
          Assert.isSuccess(result)
          return result.value
        },
        withValues: { min: 1.5, max: 3 },
        reason: "decimal integer min",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
          Assert.isSuccess(result)
          return result.value
        },
        withValues: { min: 1, max: 3.5 },
        reason: "decimal integer max",
      },
      {
        range: () => {
          const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
          Assert.isSuccess(limitsResult)
          const result = Range.createMaxInclusive({
            numericType: "integer",
            min: 0,
            maxInclusive: 10,
            limits: limitsResult.value,
          })
          Assert.isSuccess(result)
          return result.value
        },
        withValues: { min: -1, max: 3 },
        reason: "below limits",
      },
      {
        range: () => {
          const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
          Assert.isSuccess(limitsResult)
          const result = Range.createMaxExclusive({
            numericType: "integer",
            min: 0,
            maxExclusive: 10,
            limits: limitsResult.value,
          })
          Assert.isSuccess(result)
          return result.value
        },
        withValues: { min: 1, max: 11 },
        reason: "above limits",
      },
    ])("should return a Failure when the new range is invalid because of $reason", ({ range, withValues }) => {
      // Arrange
      const fromRange = range()

      // Act
      const result = Range.from(fromRange, withValues)

      // Assert
      expect(result).toMatchObject<Failure<string>>({ type: "Failure", error: expect.any(String) })
    })
  })

  describe("validate", () => {
    it.each([
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 1 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "single-value inclusive integer range",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "inclusive integer range",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "exclusive integer range",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "float", min: 1.5, maxInclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "inclusive float range",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "exclusive float range",
      },
      {
        range: () => {
          const limitsResult = Range.createMaxInclusive({ numericType: "integer", min: 0, maxInclusive: 10 })
          Assert.isSuccess(limitsResult)
          const result = Range.createMaxInclusive({
            numericType: "integer",
            min: 2,
            maxInclusive: 8,
            limits: limitsResult.value,
          })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "inclusive integer range within limits",
      },
      {
        range: () => {
          const limitsResult = Range.createMaxExclusive({ numericType: "integer", min: 0, maxExclusive: 10 })
          Assert.isSuccess(limitsResult)
          const result = Range.createMaxExclusive({
            numericType: "integer",
            min: 2,
            maxExclusive: 8,
            limits: limitsResult.value,
          })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "exclusive integer range within limits",
      },
    ])("should return true for a valid range ($reason)", ({ range }) => {
      expect(Range.validate(range())).toEqual(undefined)
    })

    it.each([
      {
        range: { type: "MaxInclusive", numericType: "integer", min: 4, maxInclusive: 3 } as const,
        reason: "inclusive min greater than maxInclusive",
      },
      {
        range: { type: "MaxExclusive", numericType: "integer", min: 3, maxExclusive: 3 } as const,
        reason: "exclusive min equal to maxExclusive",
      },
      {
        range: { type: "MaxExclusive", numericType: "integer", min: 4, maxExclusive: 3 } as const,
        reason: "exclusive min greater than maxExclusive",
      },
      { range: { type: "MaxInclusive", numericType: "integer", min: 1.1, maxInclusive: 3 } as const, reason: "decimal integer min" },
      {
        range: { type: "MaxExclusive", numericType: "integer", min: 1, maxExclusive: 3.1 } as const,
        reason: "decimal integer maxExclusive",
      },
      { range: { type: "MaxInclusive", numericType: "float", min: Number.NaN, maxInclusive: 3 } as const, reason: "NaN min" },
      { range: { type: "MaxExclusive", numericType: "float", min: 1, maxExclusive: Number.NaN } as const, reason: "NaN maxExclusive" },
      {
        range: { type: "MaxInclusive", numericType: "float", min: Number.NEGATIVE_INFINITY, maxInclusive: 3 } as const,
        reason: "infinite min",
      },
      {
        range: { type: "MaxExclusive", numericType: "float", min: 1, maxExclusive: Number.POSITIVE_INFINITY } as const,
        reason: "infinite maxExclusive",
      },
      {
        range: {
          type: "MaxInclusive",
          numericType: "integer",
          min: 1,
          maxInclusive: 3,
          limits: { type: "MaxInclusive", numericType: "integer", min: 4, maxInclusive: 10 },
        } as const,
        reason: "outside limits",
      },
      {
        range: { type: "Unknown", numericType: "integer", min: 1, maxInclusive: 3 } as unknown as RangeType<"integer">,
        reason: "unknown type",
      },
    ])("should return false for an invalid range because of $reason", ({ range }) => {
      expect(Range.validate(range)).toEqual(expect.any(String))
    })
  })

  describe("isWithin", () => {
    it.each([
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 1,
        reason: "inclusive lower bound",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 2,
        reason: "inclusive middle value",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 3,
        reason: "inclusive upper bound",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 4 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 3,
        reason: "exclusive value below upper bound",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "float", min: 1.5, maxInclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 2.25,
        reason: "float middle value",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 3.499,
        reason: "float value below exclusive upper bound",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 2.5,
        reason: "decimal value for integer range",
      },
    ])("should return true when the value is within the range at $reason", ({ range, value }) => {
      expect(Range.isWithin(range(), value)).toBe(true)
    })

    it.each([
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 0,
        reason: "below min",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 4,
        reason: "above inclusive max",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        value: 3,
        reason: "equal to exclusive max",
      },
      {
        range: () => {
          const result = Range.createMaxInclusive({ numericType: "float", min: 1.5, maxInclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        value: Number.NaN,
        reason: "NaN value",
      },
      {
        range: () => {
          const result = Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        value: Number.POSITIVE_INFINITY,
        reason: "infinite value",
      },
    ])("should return false when the value is not within the range because of $reason", ({ range, value }) => {
      expect(Range.isWithin(range(), value)).toBe(false)
    })

    it("should return false when the range is invalid", () => {
      expect(Range.isWithin({ type: "MaxInclusive", numericType: "integer", min: 4, maxInclusive: 3 }, 4)).toBe(false)
    })
  })

  describe("overlaps", () => {
    it.each([
      {
        a: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "touching inclusive upper bound",
      },
      {
        a: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 3, maxExclusive: 5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "inclusive point shared with exclusive range min",
      },
      {
        a: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 4 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "integer intersection below exclusive max",
      },
      {
        a: () => {
          const result = Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "float", min: 3.25, maxInclusive: 5.5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "float interval intersection",
      },
      {
        a: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "overlap is symmetric",
      },
    ])("should return true when ranges overlap at $reason", ({ a, b }) => {
      const rangeA = a()
      const rangeB = b()

      expect(Range.overlaps(rangeA, rangeB)).toBe(true)
      expect(Range.overlaps(rangeB, rangeA)).toBe(true)
    })

    it.each([
      {
        a: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 1, maxInclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 4, maxInclusive: 5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "gap between integer ranges",
      },
      {
        a: () => {
          const result = Range.createMaxExclusive({ numericType: "integer", min: 1, maxExclusive: 3 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "integer", min: 3, maxInclusive: 5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "exclusive upper bound touches inclusive lower bound",
      },
      {
        a: () => {
          const result = Range.createMaxExclusive({ numericType: "float", min: 1.5, maxExclusive: 3.5 })
          Assert.isSuccess(result)
          return result.value
        },
        b: () => {
          const result = Range.createMaxInclusive({ numericType: "float", min: 3.5, maxInclusive: 5.5 })
          Assert.isSuccess(result)
          return result.value
        },
        reason: "exclusive float upper bound touches lower bound",
      },
    ])("should return false when ranges do not overlap because of $reason", ({ a, b }) => {
      const rangeA = a()
      const rangeB = b()

      expect(Range.overlaps(rangeA, rangeB)).toBe(false)
      expect(Range.overlaps(rangeB, rangeA)).toBe(false)
    })
  })
})
