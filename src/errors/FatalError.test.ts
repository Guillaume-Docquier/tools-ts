import { describe, it, expect } from "vitest"
import { FatalError } from "./FatalError.js"
import { Assert } from "../Assert.js"

const FatalErrorClassName = FatalError.name
const StartsWithFatalErrorClassName = new RegExp("^" + FatalErrorClassName)

class SomeOtherError extends FatalError<{ other?: string }> {}

describe(FatalErrorClassName, () => {
  it("should remove the given caller from the stack trace", () => {
    // Arrange
    function main(): void {
      willThrow()
    }

    function willThrow(): void {
      throw new FatalError("some error", { expected: "some", received: "thing" }, willThrow)
    }

    expect.assertions(2)
    try {
      // Act
      main()
    } catch (error) {
      // Assert
      Assert.isInstanceOf(FatalError, error)
      Assert.isDefined(error.stack)
      const stackParts = error.stack.split(" at ")
      expect(stackParts[0]).toEqual(expect.stringMatching(StartsWithFatalErrorClassName))
      expect(stackParts[1]).toEqual(expect.stringContaining("main"))
    }
  })

  it("should include the caller if not provided", () => {
    // Arrange
    function main(): void {
      willThrow()
    }

    function willThrow(): void {
      throw new FatalError("some error", { expected: "some", received: "thing" })
    }

    expect.assertions(3)
    try {
      // Act
      main()
    } catch (error) {
      // Assert
      Assert.isInstanceOf(FatalError, error)
      Assert.isDefined(error.stack)

      const stackParts = error.stack.split(" at ")
      expect(stackParts[0]).toEqual(expect.stringMatching(StartsWithFatalErrorClassName))
      expect(stackParts[1]).toEqual(expect.stringContaining("willThrow"))
      expect(stackParts[2]).toEqual(expect.stringContaining("main"))
    }
  })

  it("should attach the context to the error", () => {
    // Arrange
    const expectedError = { expected: "some", received: "thing" }

    // Act
    const error = new FatalError("some error", expectedError)

    // Assert
    expect(error.context).toStrictEqual(expectedError)
  })

  it("should set the message and include the context in it", () => {
    // Arrange
    const errorMessage = "my error message"
    const context = { something: "this is the context" }

    // Act
    const error = new FatalError(errorMessage, context)

    // Assert
    expect(error.message).toContain(errorMessage)
    expect(error.message).toContain(context.something)
  })

  it("should show the context when thrown", () => {
    // Arrange
    const context = { something: "this is the context" }

    // Act & Assert
    expect(() => {
      throw new FatalError("something wrong happened", context)
    }).toThrow(context.something)
  })

  it("should prevent the error context from being modified", () => {
    // Arrange
    const context = { some: { deep: "context" } }
    const error = new FatalError("message", context)

    // Act
    context.some.deep = "changed"

    // Assert
    expect(error.context.some.deep).toEqual("context")
  })

  it("should be fatal", () => {
    // Act
    const error = new FatalError("error", { expected: "does not", received: "matter" })

    // Assert
    expect(error.isFatal).toBe(true)
  })

  it("should set its own name", () => {
    // Act
    const error = new FatalError("error", {})

    // Assert
    expect(error.name).toEqual(FatalErrorClassName)
  })

  it("should not inherit the child class name because code minification will break it", () => {
    // Act
    const error = new SomeOtherError("error", {})

    // Assert
    expect(error.name).toEqual(FatalErrorClassName)
  })
})
