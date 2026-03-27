import { describe, it, expect, expectTypeOf } from "vitest"
import { TypeGuard } from "./TypeGuard.js"
import { Theory } from "./Theory.js"

describe("TypeGuard", () => {
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

  describe("isInteger", () => {
    it.each(Theory.Integer)("should return true for integers (%o)", (integer) => {
      expect(TypeGuard.isInteger(integer)).toBe(true)
    })

    it.each(Theory.NotAnInteger)("should return false for non integers (%o)", (notInteger) => {
      expect(TypeGuard.isInteger(notInteger)).toBe(false)
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
