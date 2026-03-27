import { describe, it, expect } from "vitest"
import { AssertionError } from "./AssertionError.js"
import { Assert } from "../Assert.js"

const AssertionErrorClassName = AssertionError.name
const StartsWithAssertionErrorClassName = new RegExp("^" + AssertionErrorClassName)
const DefaultAssertionMessage = "Assertion failed!"

describe(AssertionErrorClassName, () => {
  it("should remove the given caller from the stack trace", () => {
    // Arrange
    function main(): void {
      willThrow()
    }

    function willThrow(): void {
      throw new AssertionError(DefaultAssertionMessage, { expected: "some", received: "thing" }, willThrow)
    }

    // Act & Assert
    expect.assertions(2)
    try {
      main()
    } catch (error) {
      Assert.isInstanceOf(AssertionError, error)
      Assert.isDefined(error.stack)

      const stackParts = error.stack.split(" at ")
      expect(stackParts[0]).toEqual(expect.stringMatching(StartsWithAssertionErrorClassName))
      expect(stackParts[1]).toEqual(expect.stringContaining("main"))
    }
  })

  it("should include the caller if not provided", () => {
    // Arrange
    function main(): void {
      willThrow()
    }

    function willThrow(): void {
      throw new AssertionError(DefaultAssertionMessage, { expected: "some", received: "thing" })
    }

    // Act & Assert
    expect.assertions(3)
    try {
      main()
    } catch (error) {
      Assert.isInstanceOf(AssertionError, error)
      Assert.isDefined(error.stack)

      const stackParts = error.stack.split(" at ")
      expect(stackParts[0]).toEqual(expect.stringMatching(StartsWithAssertionErrorClassName))
      expect(stackParts[1]).toEqual(expect.stringContaining("willThrow"))
      expect(stackParts[2]).toEqual(expect.stringContaining("main"))
    }
  })

  it("should remove paramName if it is undefined", () => {
    // Arrange
    const context = { expected: "some", received: "thing", paramName: undefined }

    // Act
    const error = new AssertionError(DefaultAssertionMessage, context)

    // Assert
    expect(error.context).toStrictEqual({ expected: context.expected, received: context.received })
  })

  it("should attach the context to the error", () => {
    // Arrange
    const context = { expected: "some", received: "thing" }

    // Act
    const error = new AssertionError(DefaultAssertionMessage, context)

    // Assert
    expect(error.context).toStrictEqual(context)
  })

  it("should use the context to format the error message", () => {
    // Arrange
    const context = { paramName: "paramName-test-123", expected: "expected-test-123", received: "received-test-123" }

    // Act
    const error = new AssertionError(DefaultAssertionMessage, context)

    // Assert
    expect(error.message).toContain("Assertion failed")
    expect(error.message).toContain(context.paramName)
    expect(error.message).toContain(context.expected)
    expect(error.message).toContain(context.received)
  })

  it("should be fatal", () => {
    // Act
    const error = new AssertionError(DefaultAssertionMessage, { expected: "does not", received: "matter" })

    // Assert
    expect(error.isFatal).toBe(true)
  })

  it("should set its own name", () => {
    // Act
    const error = new AssertionError(DefaultAssertionMessage, { expected: "does not", received: "matter" })

    // Assert
    expect(error.name).toEqual(AssertionErrorClassName)
  })
})
