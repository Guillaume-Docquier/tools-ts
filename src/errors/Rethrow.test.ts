import { describe, it, expect, expectTypeOf } from "vitest"
import { Rethrow } from "./Rethrow.js"
import { FatalError } from "./FatalError.js"
import { Theory } from "src/Theory.js"
import { Assert } from "src/Assert.js"

describe("Rethrow", () => {
  it.each([...Theory.Number, ...Theory.String, ...Theory.Record, ...Theory.Class, undefined, null])(
    "should throw an Assertion Error for errors that are not instances of Error (%o)",
    (error) => {
      // Act & Assert
      expect(() => {
        Rethrow.ifFatal(error)
      }).toThrow(FatalError)
    },
  )

  it("should rethrow the error if it is fatal", () => {
    // Arrange
    const error = new FatalError("error", {})

    // Act & Assert
    expect(() => {
      Rethrow.ifFatal(error)
    }).toThrow(error)
  })

  it("should allow non fatal Errors", () => {
    // Arrange
    const error = new Error("error")

    // Act & Assert
    expect(() => {
      Rethrow.ifFatal(error)
    }).not.toThrow(error)
  })

  it("should narrow the type to Error", () => {
    // Arrange
    const error: unknown = new Error("error")
    expectTypeOf(error).not.toEqualTypeOf<Error>()

    // Act
    Rethrow.ifFatal(error)

    // Assert
    expectTypeOf(error).toEqualTypeOf<Error>()
  })

  it("should not mess with the stack trace when rethrowing", () => {
    // Arrange
    function main(): void {
      try {
        willThrow()
      } catch (error) {
        Rethrow.ifFatal(error)
      }
    }

    function willThrow(): void {
      throw new FatalError("error inside willThrow", {})
    }

    // Act & Assert
    expect.assertions(2)
    try {
      main()
    } catch (error) {
      if (!(error instanceof FatalError)) {
        throw error
      }

      Assert.isDefined(error.stack)
      const stackParts = error.stack.split("\n")

      expect(stackParts[1]).toEqual(expect.stringContaining("at willThrow"))
      expect(stackParts[2]).toEqual(expect.stringContaining("at main"))
    }
  })

  it("should not include Rethrow.fatalError in the stack trace when throwing because the error is not an instance of Error", () => {
    // Arrange
    function main(): void {
      try {
        throw 1
      } catch (error) {
        Rethrow.ifFatal(error)
      }
    }

    // Act & Assert
    expect.assertions(1)
    try {
      main()
    } catch (error) {
      if (!(error instanceof FatalError)) {
        throw error
      }

      Assert.isDefined(error.stack)
      const stackParts = error.stack.split(" at ")

      expect(stackParts[1]).toEqual(expect.stringContaining("main"))
    }
  })
})
