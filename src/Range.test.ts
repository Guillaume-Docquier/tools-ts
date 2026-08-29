import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { Assert } from "./Assert.js"
import { AssertionError } from "./errors/AssertionError.js"
import { Range } from "./Range.js"
import { Result } from "./Result.js"

describe("Range", () => {
  describe("create", () => {
    it("should return a Range with valid data", () => {
      // Arrange
      const data = { numericType: "integer", maxBoundType: "inclusive", min: 2, max: 8 } as const satisfies Range
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act
      const range = Range.create(data)

      // Assert
      expect(range).toBe<typeof range>(data)
      expectTypeOf(range).toEqualTypeOf<Range<"integer", "inclusive">>()
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith(data)
    })

    it("should throw with invalid data", () => {
      // Arrange
      const invalidData = { numericType: "integer", maxBoundType: "inclusive", min: 3, max: 2 } as const
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act & Assert
      expect(() => Range.create(invalidData)).toThrow(AssertionError)
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith(invalidData)
    })
  })

  describe("float", () => {
    it("should return a Range with valid data", () => {
      // Arrange
      const data = { min: 2, max: 8 } as const satisfies Pick<Range, "min" | "max">
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act
      const range = Range.float(data)

      // Assert
      const expectedRange = { numericType: "float", maxBoundType: "exclusive", ...data } as const
      expect(range).toStrictEqual<typeof range>(expectedRange)
      expectTypeOf(range).toEqualTypeOf<Range<"float", "exclusive">>()
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith(expectedRange)
    })

    it("should throw with invalid data", () => {
      // Arrange
      const invalidData = { min: 3, max: 2 } as const satisfies Pick<Range, "min" | "max">
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act & Assert
      expect(() => Range.float(invalidData)).toThrow(AssertionError)
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith({ numericType: "float", maxBoundType: "exclusive", ...invalidData })
    })
  })

  describe("integer", () => {
    it("should return a Range with valid data", () => {
      // Arrange
      const data = { min: 2, max: 8 } as const satisfies Pick<Range, "min" | "max">
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act
      const range = Range.integer(data)

      // Assert
      const expectedRange = { numericType: "integer", maxBoundType: "inclusive", ...data } as const
      expect(range).toStrictEqual<typeof range>(expectedRange)
      expectTypeOf(range).toEqualTypeOf<Range<"integer", "inclusive">>()
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith(expectedRange)
    })

    it("should throw with invalid data", () => {
      // Arrange
      const invalidData = { min: 3, max: 2 } as const satisfies Pick<Range, "min" | "max">
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act & Assert
      expect(() => Range.integer(invalidData)).toThrow(AssertionError)
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith({ numericType: "integer", maxBoundType: "inclusive", ...invalidData })
    })
  })

  describe("safeCreate", () => {
    it.each([
      {
        data: { numericType: "integer", maxBoundType: "inclusive", min: 1, max: 10 } as const satisfies Range,
        reason: "inclusive integer with min < max",
      },
      {
        data: { numericType: "integer", maxBoundType: "inclusive", min: 1, max: 1 } as const satisfies Range,
        reason: "inclusive integer with min == max",
      },
      {
        data: { numericType: "integer", maxBoundType: "exclusive", min: 1, max: 10 } as const satisfies Range,
        reason: "exclusive integer with min < max",
      },
      {
        data: { numericType: "float", maxBoundType: "inclusive", min: 1, max: 10 } as const satisfies Range,
        reason: "inclusive float with min < max",
      },
      {
        data: { numericType: "float", maxBoundType: "inclusive", min: 1.3, max: 1.3 } as const satisfies Range,
        reason: "inclusive float with min == max",
      },
      {
        data: { numericType: "float", maxBoundType: "exclusive", min: 1, max: 10 } as const satisfies Range,
        reason: "exclusive float with min < max",
      },
    ])("should return a Success when $reason", ({ data }) => {
      // Act
      const rangeResult = Range.safeCreate(data)

      // Assert
      expect(rangeResult).toStrictEqual<typeof rangeResult>(Result.Success(data))
    })

    it("should narrow the Range type based on the input", () => {
      // Arrange
      const data = { numericType: "float", maxBoundType: "exclusive", min: 2, max: 8 } as const satisfies Range

      // Act
      const rangeResult = Range.safeCreate(data)

      // Assert
      expect(rangeResult).toStrictEqual<typeof rangeResult>(Result.Success(data))
      expectTypeOf(rangeResult).toEqualTypeOf<Result<Range<"float", "exclusive">, string>>()
    })

    it.each([
      {
        invalidData: { numericType: "integer", maxBoundType: "inclusive", min: 1.3, max: 3 } as const satisfies Range,
        reason: "integer with float min",
      },
      {
        invalidData: { numericType: "integer", maxBoundType: "inclusive", min: 0, max: 1.3 } as const satisfies Range,
        reason: "integer with float max",
      },
      {
        invalidData: { numericType: "integer", maxBoundType: "inclusive", min: 1, max: 0 } as const satisfies Range,
        reason: "inclusive integer with min > max",
      },
      {
        invalidData: { numericType: "integer", maxBoundType: "exclusive", min: 1, max: 1 } as const satisfies Range,
        reason: "exclusive integer with min == max",
      },
      {
        invalidData: { numericType: "integer", maxBoundType: "exclusive", min: 1, max: 0 } as const satisfies Range,
        reason: "exclusive integer with min > max",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "inclusive", min: 1.3, max: 0.3 } as const satisfies Range,
        reason: "inclusive float with min > max",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "exclusive", min: 1.3, max: 1.3 } as const satisfies Range,
        reason: "exclusive float with min == max",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "exclusive", min: 1.3, max: 0.3 } as const satisfies Range,
        reason: "exclusive float with min > max",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "inclusive", min: Number.NaN, max: 0 } as const satisfies Range,
        reason: "min is NaN",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "inclusive", min: 0, max: Number.NaN } as const satisfies Range,
        reason: "max is NaN",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "inclusive", min: Number.NEGATIVE_INFINITY, max: 0 } as const satisfies Range,
        reason: "min is infinite",
      },
      {
        invalidData: { numericType: "float", maxBoundType: "inclusive", min: 0, max: Number.POSITIVE_INFINITY } as const satisfies Range,
        reason: "max is infinite",
      },
    ])("should return a Failure when $reason", ({ invalidData }) => {
      // Act
      const rangeResult = Range.safeCreate(invalidData)

      // Assert
      expect(rangeResult).toStrictEqual<typeof rangeResult>(Result.Failure(expect.any(String)))
    })
  })

  describe("from", () => {
    it("should return a Success with valid data", () => {
      // Arrange
      const range = Range.create({ numericType: "integer", min: 2, maxBoundType: "exclusive", max: 8 })
      const data = { min: 3, max: 7 }
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act
      const result = Range.from(range, data)

      // Assert
      expect(result).toStrictEqual<typeof result>(Result.Success({ ...range, min: 3, max: 7 }))
      expectTypeOf(result).toEqualTypeOf<Result<Range<"integer", "exclusive">, string>>()
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith({ ...range, ...data })
    })

    it("should not mutate the original data", () => {
      // Arrange
      const data = { numericType: "integer", min: 2, maxBoundType: "exclusive", max: 8 } as const satisfies Range
      const original = Range.create(data)
      const range = Range.create(data)

      // Act
      const result = Range.from(range, { min: 3, max: 7 })

      // Assert
      Assert.isSuccess(result)
      expect(range).toStrictEqual(original)
      expect(range).not.toStrictEqual(result.value)
      expect(range).not.toBe(result.value)
    })

    it("should return a Failure with invalid data", () => {
      // Arrange
      const fromRange = Range.create({ numericType: "integer", min: 0, maxBoundType: "inclusive", max: 10 })
      const data = { min: 1.1, max: 2 }
      const validateSpy = vi.spyOn(Range, "safeCreate")

      // Act
      const result = Range.from(fromRange, { min: 1.1, max: 2 })

      // Assert
      expect(result).toMatchObject<typeof result>(Result.Failure(expect.any(String)))
      expect(validateSpy).toHaveBeenCalledExactlyOnceWith({ ...fromRange, ...data })
    })
  })

  describe("isWithin", () => {
    describe("when value is a number", () => {
      it.each([
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: 1,
          reason: "integer value is equal to min",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: 2,
          reason: "integer value is within range",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: 3,
          reason: "integer value is equal to inclusive max",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          value: 3,
          reason: "integer value is below exclusive max",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.1, maxBoundType: "inclusive", max: 3 }),
          value: 1.1,
          reason: "float value is equal to min",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.5, maxBoundType: "inclusive", max: 3.5 }),
          value: 2.25,
          reason: "float value is within range",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.5, maxBoundType: "inclusive", max: 3.5 }),
          value: 3.5,
          reason: "float value is equal to inclusive max",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.5, maxBoundType: "exclusive", max: 3.5 }),
          value: 3.499,
          reason: "float value is below exclusive max",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: 2.5,
          reason: "float value is within integer range",
        },
      ])("should return true when $reason", ({ bounds, value }) => {
        expect(Range.isWithin(bounds, value)).toBe(true)
      })

      it.each([
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: 0,
          reason: "value is below min",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: 4,
          reason: "value is above inclusive max",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 3 }),
          value: 3,
          reason: "value is equal to exclusive max",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.5, maxBoundType: "inclusive", max: 3.5 }),
          value: Number.NaN,
          reason: "value is NaN",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.5, maxBoundType: "exclusive", max: 3.5 }),
          value: Number.POSITIVE_INFINITY,
          reason: "value is infinite",
        },
      ])("should return false when $reason", ({ bounds, value }) => {
        expect(Range.isWithin(bounds, value)).toBe(false)
      })
    })

    describe("when value is a Range", () => {
      it.each([
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 3] contains integer [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 3 }),
          reason: "integer [1, 3) contains integer [1, 3)",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.3, maxBoundType: "inclusive", max: 3.3 }),
          value: Range.create({ numericType: "float", min: 1.3, maxBoundType: "inclusive", max: 3.3 }),
          reason: "float [1.3, 3.3] contains float [1.3, 3.3]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.3, maxBoundType: "exclusive", max: 3.3 }),
          value: Range.create({ numericType: "float", min: 1.3, maxBoundType: "exclusive", max: 3.3 }),
          reason: "float [1.3, 3.3) contains float [1.3, 3.3)",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          reason: "integer [1, 3] contains integer [1, 4)",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 5 }),
          value: Range.create({ numericType: "integer", min: 2, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 5) contains integer [2, 3]",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 4) contains integer [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.3, maxBoundType: "inclusive", max: 3.3 }),
          value: Range.create({ numericType: "float", min: 1.3, maxBoundType: "exclusive", max: 3.3 }),
          reason: "float [1.3, 3.3] contains float [1.3, 3.3)",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "float [1, 3] contains integer [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          reason: "float [1, 3] contains integer [1, 4)",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 3] contains float [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "exclusive", max: 3 }),
          reason: "integer [1, 3] contains float [1, 3)",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 4) contains float [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "exclusive", max: 3 }),
          reason: "integer [1, 4) contains float [1, 3)",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1.3, maxBoundType: "exclusive", max: 3.3 }),
          value: Range.create({ numericType: "float", min: 1.3, maxBoundType: "exclusive", max: 3.3 }),
          reason: "float [1.3, 3.3) contains float [1.3, 3.3)",
        },
      ])("should return true when $reason", ({ bounds, value }) => {
        expect(Range.isWithin(bounds, value)).toBe(true)
      })

      it.each([
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 0, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 3] does not contain integer [0, 3]",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 4 }),
          reason: "integer [1, 3] does not contain integer [1, 4]",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "integer [1, 3) does not contain integer [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1, maxBoundType: "exclusive", max: 3.3 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3.3 }),
          reason: "float [1, 3.3) does not contain float [1, 3.3]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1, maxBoundType: "exclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          reason: "float [1, 3) does not contain integer [1, 3]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1, maxBoundType: "exclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          reason: "float [1, 3) does not contain integer [1, 4)",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "exclusive", max: 4 }),
          reason: "integer [1, 3] does not contain float [1, 4)",
        },
        {
          bounds: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
          value: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3.5 }),
          reason: "integer [1, 4) does not contain float [1, 3.5]",
        },
        {
          bounds: Range.create({ numericType: "float", min: 1, maxBoundType: "inclusive", max: 3 }),
          value: Range.create({ numericType: "integer", min: 0, maxBoundType: "inclusive", max: 3 }),
          reason: "float [1, 3] does not contain integer [0, 3]",
        },
      ])("should return false when $reason", ({ bounds, value }) => {
        expect(Range.isWithin(bounds, value)).toBe(false)
      })
    })
  })

  describe("overlaps", () => {
    it.each([
      {
        a: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
        b: Range.create({ numericType: "integer", min: 3, maxBoundType: "inclusive", max: 5 }),
        reason: "min of inclusive range equals inclusive max",
      },
      {
        a: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
        b: Range.create({ numericType: "integer", min: 3, maxBoundType: "exclusive", max: 5 }),
        reason: "min of exclusive range equals inclusive max",
      },
      {
        a: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 4 }),
        b: Range.create({ numericType: "integer", min: 3, maxBoundType: "inclusive", max: 5 }),
        reason: "integer min is within range",
      },
      {
        a: Range.create({ numericType: "float", min: 1.5, maxBoundType: "exclusive", max: 3.5 }),
        b: Range.create({ numericType: "float", min: 3.25, maxBoundType: "inclusive", max: 5.5 }),
        reason: "float min is within range",
      },
    ])("should return true when $reason", ({ a, b }) => {
      expect(Range.overlaps(a, b)).toBe(true)
      expect(Range.overlaps(b, a)).toBe(true)
    })

    it.each([
      {
        a: Range.create({ numericType: "integer", min: 1, maxBoundType: "inclusive", max: 3 }),
        b: Range.create({ numericType: "integer", min: 4, maxBoundType: "inclusive", max: 5 }),
        reason: "min is outside the range",
      },
      {
        a: Range.create({ numericType: "integer", min: 1, maxBoundType: "exclusive", max: 3 }),
        b: Range.create({ numericType: "integer", min: 3, maxBoundType: "inclusive", max: 5 }),
        reason: "min of inclusive range is equal to exclusive max",
      },
      {
        a: Range.create({ numericType: "float", min: 1.5, maxBoundType: "exclusive", max: 3.5 }),
        b: Range.create({ numericType: "float", min: 3.5, maxBoundType: "inclusive", max: 5.5 }),
        reason: "min of exclusive range is equal to exclusive max",
      },
    ])("should return false when $reason", ({ a, b }) => {
      expect(Range.overlaps(a, b)).toBe(false)
      expect(Range.overlaps(b, a)).toBe(false)
    })
  })
})
