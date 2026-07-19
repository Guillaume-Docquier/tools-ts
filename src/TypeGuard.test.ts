import { describe, it, expect, expectTypeOf } from "vitest"
import { Theory } from "./Theory.js"
import { TypeGuard } from "./TypeGuard.js"

describe("TypeGuard", () => {
  describe("isFunction", () => {
    it.each(Theory.Function)("should return true for functions (%o)", (func) => {
      expect(TypeGuard.isFunction(func)).toBe(true)
    })

    it.each(Theory.NotAFunction)("should return false for non functions (%o)", (notFunction) => {
      expect(TypeGuard.isFunction(notFunction)).toBe(false)
    })

    it("should narrow the type", () => {
      // Arrange
      const maybeFunction = (() => {}) as unknown

      // Act
      expectTypeOf(maybeFunction).not.toEqualTypeOf<(...args: unknown[]) => unknown>()
      if (TypeGuard.isFunction(maybeFunction)) {
        // Assert
        expectTypeOf(maybeFunction).toEqualTypeOf<(...args: unknown[]) => unknown>()
      }
    })
  })

  describe("isPromiseLike", () => {
    it.each(Theory.PromiseLike)("should return true for records with a then function (%o)", (promiseLike) => {
      expect(TypeGuard.isPromiseLike(promiseLike)).toBe(true)
    })

    it.each(Theory.NotPromiseLike)("should return false for values without a then function on a record (%o)", (notPromiseLike) => {
      expect(TypeGuard.isPromiseLike(notPromiseLike)).toBe(false)
    })

    it("should narrow the type", () => {
      // Arrange
      // oxlint-disable-next-line unicorn/no-thenable -- This is intentional to cover 3rd party code that does this
      const maybeThenable = { then: async () => await Promise.resolve("value") } as unknown

      // Act
      expectTypeOf(maybeThenable).not.toEqualTypeOf<PromiseLike<unknown>>()
      if (TypeGuard.isPromiseLike(maybeThenable)) {
        // Assert
        expectTypeOf(maybeThenable).toEqualTypeOf<PromiseLike<unknown>>()
      }
    })
  })

  describe("isBoolean", () => {
    it.each(Theory.Boolean)("should return true for booleans (%o)", (boolean) => {
      expect(TypeGuard.isBoolean(boolean)).toBe(true)
    })

    it.each(Theory.NotABoolean)("should return false for non booleans (%o)", (notBoolean) => {
      expect(TypeGuard.isBoolean(notBoolean)).toBe(false)
    })
  })

  describe("isString", () => {
    it.each(Theory.String)("should return true for strings (%o)", (string) => {
      expect(TypeGuard.isString(string)).toBe(true)
    })

    it.each(Theory.NotAString)("should return false for non string (%o)", (notString) => {
      expect(TypeGuard.isString(notString)).toBe(false)
    })
  })

  describe("isNumber", () => {
    it.each(Theory.Number)("should return true for numbers (%o)", (number) => {
      expect(TypeGuard.isNumber(number)).toBe(true)
    })

    it.each(Theory.NotANumber)("should return false for non numbers (%o)", (notNumber) => {
      expect(TypeGuard.isNumber(notNumber)).toBe(false)
    })
  })

  describe("isArray", () => {
    it.each(Theory.Array)("should return true for arrays (%o)", ({ array }) => {
      expect(TypeGuard.isArray(array)).toBe(true)
    })

    it.each(Theory.NotAnArray)("should return false for non arrays (%o)", (notAnArray) => {
      expect(TypeGuard.isArray(notAnArray)).toBe(false)
    })
  })

  describe("isRecord", () => {
    it.each([...Theory.Record, ...Theory.Class])("should return true for records (%o)", (record) => {
      expect(TypeGuard.isRecord(record)).toBe(true)
    })

    it.each(Theory.NotARecord)("should return false for non records (%o)", (notARecord) => {
      expect(TypeGuard.isRecord(notARecord)).toBe(false)
    })
  })

  describe("isEnumMember", () => {
    describe("when enum is a number (normal) enum", () => {
      const VALID_THEORY = ["ONE", "TWO", "THREE", NumberEnum.ONE, NumberEnum.TWO, NumberEnum.THREE, 0, 1, 2]
      it.each(VALID_THEORY)("should return true when maybeEnumValue is an enum value given %o", (enumValue) => {
        // Act
        const result = TypeGuard.isEnumMember(NumberEnum, enumValue)

        // Assert
        expect(result).toBeTruthy()
      })

      const INVALID_THEORY = ["0", "1", "2", "", "string", {}, [], null, undefined, true, false]
      it.each(INVALID_THEORY)("should return false when maybeEnumValue is not an enum value given %o", (notAnEnumValue) => {
        // Act
        const result = TypeGuard.isEnumMember(NumberEnum, notAnEnumValue)

        // Assert
        expect(result).toBeFalsy()
      })
    })

    describe("when maybeEnumValue is an enum value", () => {
      const VALID_THEORY = [StringEnum.ONE, StringEnum.TWO, StringEnum.THREE, "one", "two", "three"]
      it.each(VALID_THEORY)("should return true when maybeEnumValue is an enum value given %o", (enumValue) => {
        // Act
        const result = TypeGuard.isEnumMember(StringEnum, enumValue)

        // Assert
        expect(result).toBeTruthy()
      })

      const INVALID_THEORY = ["0", "1", "2", "ONE", "TWO", "THREE", "", "string", {}, [], null, undefined, true, false]
      it.each(INVALID_THEORY)("should return false when maybeEnumValue is not an enum value given %o", (notAnEnumValue) => {
        // Act
        const result = TypeGuard.isEnumMember(StringEnum, notAnEnumValue)

        // Assert
        expect(result).toBeFalsy()
      })
    })

    it("should return narrow the type", () => {
      // Arrange
      const maybeEnum = "hello" as unknown

      // Act
      expectTypeOf(maybeEnum).not.toEqualTypeOf<NumberEnum>()
      if (TypeGuard.isEnumMember(NumberEnum, maybeEnum)) {
        // Assert
        expectTypeOf(maybeEnum).toEqualTypeOf<NumberEnum>()
      }
    })
  })
})

enum NumberEnum {
  ONE,
  TWO,
  THREE,
}

enum StringEnum {
  ONE = "one",
  TWO = "two",
  THREE = "three",
}
