import { describe, it, expect, expectTypeOf } from "vitest"
import { Assert } from "./Assert.js"
import { AssertionError } from "./errors/AssertionError.js"
import { Result, Success } from "./Result.js"

describe("Assert", () => {
  describe("isInstanceOf", () => {
    it("should throw an AssertionError when the argument is not an instance of the expected class", () => {
      // Arrange
      const maybeFoo: unknown = new Bar()

      // Act & Assert
      expect(() => {
        Assert.isInstanceOf(Foo, maybeFoo)
      }).toThrow(AssertionError)
    })

    it.each([
      { instance: new Bar(), expectedName: "Bar" },
      { instance: 1, expectedName: "Number" },
      { instance: undefined, expectedName: "undefined" },
    ])("should throw a clear error message with a $expectedName", ({ instance, expectedName }) => {
      // Act
      let error: unknown
      try {
        Assert.isInstanceOf(Foo, instance)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        expected: "Foo",
        received: expectedName,
      })
    })

    it("should use the provided param name in the error message", () => {
      // Arrange
      const instance = new Bar()
      const paramName = "my parameter name"

      // Act
      let error: unknown
      try {
        Assert.isInstanceOf(Foo, instance, paramName)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        paramName,
        expected: "Foo",
        received: instance.constructor.name,
      })
    })

    it("should not throw and narrow the type when the argument is of the expected class", () => {
      // Arrange
      const maybeFoo: unknown = new Foo()
      expectTypeOf(maybeFoo).not.toEqualTypeOf<Foo>()

      // Act
      Assert.isInstanceOf(Foo, maybeFoo)

      // Assert
      expectTypeOf(maybeFoo).toEqualTypeOf<Foo>()
      expect(maybeFoo).toBeInstanceOf(Foo)
    })
  })

  describe("isDefined", () => {
    it.each([null, undefined])("should throw an AssertionError when the argument is %o", () => {
      // Act & Assert
      expect(() => {
        Assert.isDefined(undefined)
      }).toThrow(AssertionError)
    })

    it.each([new Bar(), 1, "hello"])("should not throw and narrow the type when the argument is defined (%o)", (maybeDefined) => {
      // Act
      Assert.isDefined(maybeDefined)

      // Assert
      expectTypeOf(maybeDefined).toEqualTypeOf<Bar | number | string>()
      expect(maybeDefined).toBeDefined()
    })

    it("should use the provided param name in the error message given %o", () => {
      // Arrange
      const paramName = "my parameter name"

      // Act
      let error: unknown
      try {
        Assert.isDefined(null, paramName)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        paramName,
        expected: "neither null nor undefined",
        received: "null",
      })
    })

    it("should serialize 'undefined' and not drop it", () => {
      // Arrange
      const paramName = "my parameter name"

      // Act
      let error: unknown
      try {
        Assert.isDefined(undefined, paramName)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.message).toContain('"received": "undefined"') // JSON.stringify drops undefined values, so we test that it was properly serialized and displayed
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        paramName,
        expected: "neither null nor undefined",
        received: "undefined",
      })
    })
  })

  describe("isEnumMember", () => {
    describe("when enum is a number (normal) enum", () => {
      const VALID_THEORY = ["ONE", "TWO", "THREE", NumberEnum.ONE, NumberEnum.TWO, NumberEnum.THREE, 0, 1, 2]
      it.each(VALID_THEORY)("should not throw when maybeEnumValue is an enum value given %o", (enumValue) => {
        expectTypeOf(enumValue).not.toEqualTypeOf<StringEnum>()
        Assert.isEnumMember(NumberEnum, enumValue)
        expectTypeOf(enumValue).toEqualTypeOf<NumberEnum>()
      })

      const INVALID_THEORY = ["0", "1", "2", "", "string", {}, [], null, undefined, true, false]
      it.each(INVALID_THEORY)("should throw an AssertionError when maybeEnumValue is not an enum value given %o", (notAnEnumValue) => {
        expect(() => {
          Assert.isEnumMember(NumberEnum, notAnEnumValue)
        }).toThrow(AssertionError)
      })
    })

    describe("when enum is a string enum", () => {
      const VALID_THEORY = [StringEnum.ONE, StringEnum.TWO, StringEnum.THREE, "one", "two", "three"]
      it.each(VALID_THEORY)("should not throw when maybeEnumValue is an enum value given %o", (enumValue) => {
        expectTypeOf(enumValue).not.toEqualTypeOf<StringEnum>()
        Assert.isEnumMember(StringEnum, enumValue)
        expectTypeOf(enumValue).toEqualTypeOf<StringEnum>()
      })

      const INVALID_THEORY = ["0", "1", "2", "ONE", "TWO", "THREE", "", "string", {}, [], null, undefined, true, false]
      it.each(INVALID_THEORY)("should throw an AssertionError when maybeEnumValue is not an enum value given %o", (notAnEnumValue) => {
        expect(() => {
          Assert.isEnumMember(StringEnum, notAnEnumValue)
        }).toThrow(AssertionError)
      })
    })

    it.each([
      { value: "not an enum value", received: "not an enum value" },
      { value: 9000, received: 9000 },
      { value: { a: { b: ["c"] } }, received: JSON.stringify({ a: { b: ["c"] } }) },
      { value: [1, 2, 3], received: JSON.stringify([1, 2, 3]) },
      { value: null, received: "null" },
      { value: undefined, received: "undefined" },
      { value: true, received: "true" },
      { value: false, received: "false" },
    ])("should throw an AssertionError with a clear context when maybeEnumValue is not an enum value ($value)", ({ value, received }) => {
      // Act
      let error: unknown
      try {
        Assert.isEnumMember(NumberEnum, value)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        expected: "one of ['ONE', 'TWO', 'THREE', 0, 1, 2]",
        received,
      })
    })

    it("should quote strings to make it obvious when it's a number or a string", () => {
      // Act
      let error: unknown
      try {
        Assert.isEnumMember(NumberEnum, "2")
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        expected: "one of ['ONE', 'TWO', 'THREE', 0, 1, 2]",
        received: "2", // The string "2" is invalid, but the number 2 is valid
      })
    })

    it("should not escape single quotes because it's complicated for no reason. Please don't be a dick!", () => {
      // Act
      let error: unknown
      try {
        Assert.isEnumMember(StringEnum, "hey")
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        expected: "one of ['one', 'two', 'three', 'one, one', 'hey']", // That would be hella confusing, because it looks like 'hey' is valid, but why would you expect the value "one, one', 'hey" ???
        received: "hey",
      })
    })
  })

  describe("isOneOf", () => {
    it("should not throw when maybeValue is one of the expected values", () => {
      const maybeValue: unknown = 1

      expectTypeOf(maybeValue).not.toEqualTypeOf<0 | 1 | 2>()
      Assert.isOneOf([0, 1, 2] as const, maybeValue)
      expectTypeOf(maybeValue).toEqualTypeOf<0 | 1 | 2>()
    })

    it("should accept readonly arrays", () => {
      const maybeValue: unknown = 1
      const acceptedValues = [0, 1, 2] as const
      // ^? readonly [0, 1, 2]

      expectTypeOf(maybeValue).not.toEqualTypeOf<0 | 1 | 2>()
      Assert.isOneOf(acceptedValues, maybeValue)
      expectTypeOf(maybeValue).toEqualTypeOf<0 | 1 | 2>()
    })

    it("should accept non readonly arrays", () => {
      const maybeValue: unknown = 1

      expectTypeOf(maybeValue).not.toEqualTypeOf<0 | 1 | 2>()
      Assert.isOneOf([0, 1, 2] as const, maybeValue)
      // ^? [0, 1, 2]
      expectTypeOf(maybeValue).toEqualTypeOf<0 | 1 | 2>()
    })

    const INVALID_THEORY = ["0", "1", "2", "ONE", "TWO", "THREE", "", "string", {}, [], null, undefined, true, false]
    it.each(INVALID_THEORY)("should throw an AssertionError when maybeValue is not an expected value given %o", (notOneOf) => {
      expect(() => {
        Assert.isOneOf([0, 1, 2] as const, notOneOf)
      }).toThrow(AssertionError)
    })

    it.each([
      { maybeValue: "not an expected value", received: "not an expected value" },
      { maybeValue: 9000, received: 9000 },
      { maybeValue: { a: { b: [1] } }, received: JSON.stringify({ a: { b: [1] } }) },
      { maybeValue: [1, 2, 3], received: "[1,2,3]" },
      { maybeValue: null, received: "null" },
      { maybeValue: undefined, received: "undefined" },
      { maybeValue: true, received: "true" },
      { maybeValue: false, received: "false" },
    ])(
      "should throw an AssertionError with a clear context when maybeValue is not an expected value ($value)",
      ({ maybeValue, received }) => {
        // Act
        let error: unknown
        try {
          Assert.isOneOf([0, 1, 2] as const, maybeValue)
        } catch (e) {
          error = e
        }

        // Assert
        Assert.isInstanceOf(AssertionError, error)
        expect(error.context).toStrictEqual<(typeof error)["context"]>({
          expected: "one of [0, 1, 2]",
          received,
        })
      },
    )

    it("should quote strings to make it obvious when it's a number or a string", () => {
      // Act
      let error: unknown
      try {
        Assert.isOneOf([0, "1", 2] as const, "2")
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        expected: "one of [0, '1', 2]",
        received: "2", // The string "2" is invalid, but the number 2 is valid
      })
    })

    it("should not escape single quotes because it's complicated for no reason. Please don't be a dick!", () => {
      // Act
      let error: unknown
      try {
        Assert.isOneOf([0, "1', '3", 2] as const, "3")
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        expected: "one of [0, '1', '3', 2]", // That would be hella confusing, because it looks like '3' is valid, but why would you expect the value "1', '3" ???
        received: "3",
      })
    })
  })

  describe("isTrue", () => {
    it("should throw an AssertionError when the condition is false", () => {
      // Arrange
      const paramName = "my condition"
      const condition = false

      // Act
      let error: unknown
      try {
        Assert.isTrue(condition, paramName)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        paramName,
        expected: "a true value",
        received: "false",
      })
    })

    it("should narrow the type when the condition is truthy", () => {
      // Arrange
      const a = true as boolean
      const b = 2 as unknown
      const myObj = { a, b } as unknown as { a: boolean }

      expectTypeOf(a).toEqualTypeOf<boolean>()
      expectTypeOf(b).toEqualTypeOf<unknown>()
      expectTypeOf(myObj).not.toEqualTypeOf<{ a: boolean; b: unknown }>()

      // Act
      Assert.isTrue(a && b === 2)
      Assert.isTrue("b" in myObj && typeof myObj.b === "number")

      // Assert
      expectTypeOf(a).toEqualTypeOf<true>()
      // Here we resort to typeof since Typescript widens the type of b to number if passed as an argument
      expectTypeOf<typeof b>().toEqualTypeOf<2>()
      expectTypeOf(myObj.b).toEqualTypeOf<number>()
    })
  })

  describe("isExhausted", () => {
    it("should not produce errors for exhaustive switch cases", () => {
      // Arrange
      const value = 1 as "a" | 1 | null

      // Act & Assert
      switch (value) {
        case "a":
          break
        case 1:
          break
        case null:
          break
        default:
          Assert.isExhausted(value) // no error, will never get called if the types are correct
      }
    })

    it("should produce a typescript error for non-exhaustive switch cases", () => {
      // Arrange
      const value = 1 as "a" | 1 | null

      // Act & Assert
      switch (value) {
        case "a":
          break
        case 1:
          break
        default:
          // @ts-expect-error -- TS2345: Argument of type null is not assignable to parameter of type never
          Assert.isExhausted(value)
      }
    })

    it("should throw if called", () => {
      expect(() => {
        Assert.isExhausted(undefined as unknown as never)
      }).toThrow(AssertionError)
    })
  })

  describe("isSuccess", () => {
    it("should throw an AssertionError when the Result is a Failure", () => {
      // Arrange
      const paramName = "my result"
      const result = Result.Failure("ouch")

      // Act
      let error: unknown
      try {
        Assert.isSuccess(result, paramName)
      } catch (e) {
        error = e
      }

      // Assert
      Assert.isInstanceOf(AssertionError, error)
      expect(error.context).toStrictEqual<(typeof error)["context"]>({
        paramName,
        expected: "a Success",
        received: "a Failure: ouch",
      })
    })

    it("should narrow the type when the Result is a Success", () => {
      // Arrange
      const result = Result.Success("yay") as Result<string, unknown>

      expectTypeOf(result).toEqualTypeOf<Result<string, unknown>>()
      expectTypeOf(result).not.toEqualTypeOf<Success<string>>()

      // Act
      Assert.isSuccess(result)

      // Assert
      expectTypeOf(result).toEqualTypeOf<Success<string>>()
    })
  })

  describe.skip("unskip to inspect the output of thrown errors", () => {
    it("Assert.isInstanceOf", () => {
      Assert.isInstanceOf(Bar, new Foo())
    })

    it("Assert.isDefined", () => {
      Assert.isDefined(undefined)
    })

    it("Assert.isEnumMember", () => {
      Assert.isEnumMember(StringEnum, "hey")
    })

    it("Assert.isOneOf", () => {
      Assert.isOneOf([0, "1", 2] as const, "2")
    })

    it("Assert.isExhausted", () => {
      Assert.isExhausted(true as unknown as never)
    })

    it("Assert.isTrue", () => {
      Assert.isTrue(false)
    })

    it("Assert.isSuccess", () => {
      Assert.isSuccess(Result.Failure("something went wrong"))
    })
  })
})

class Foo {
  public readonly foo = true
}

class Bar {
  public readonly bar = true
}

enum NumberEnum {
  ONE,
  TWO,
  THREE,
}

enum StringEnum {
  ONE = "one",
  TWO = "two",
  THREE = "three",
  BITCH_PLEASE = "one, one', 'hey",
}
