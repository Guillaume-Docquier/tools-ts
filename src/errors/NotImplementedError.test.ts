import { describe, it, expect } from "vitest"
import { NotImplementedError } from "./NotImplementedError.js"

const NotImplementedErrorClassName = NotImplementedError.name

// oxlint-disable-next-line vitest/valid-title -- It is a string
describe(NotImplementedErrorClassName, () => {
  it("should attach the context to the error", () => {
    // Arrange
    const context = { trackedBy: "url" }

    // Act
    const error = new NotImplementedError(context)

    // Assert
    expect(error.context).toStrictEqual(context)
  })

  it("should use the context to format the error message", () => {
    // Arrange
    const context = { trackedBy: "trackedBy-test-123" }

    // Act
    const error = new NotImplementedError(context)

    // Assert
    expect(error.message).toContain("not yet implemented")
    expect(error.message).toContain(context.trackedBy)
  })

  it("should be fatal", () => {
    // Act
    const error = new NotImplementedError({ trackedBy: "url" })

    // Assert
    expect(error.isFatal).toBe(true)
  })

  it("should set its own name", () => {
    // Act
    const error = new NotImplementedError({ trackedBy: "url" })

    // Assert
    expect(error.name).toStrictEqual(NotImplementedErrorClassName)
  })
})
