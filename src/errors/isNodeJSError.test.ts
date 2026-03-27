import { describe, it, expect } from "vitest"
import { isNodeJSError } from "./isNodeJSError.js"
import * as fs from "node:fs"

describe("isNodeJSError", () => {
  it("should return true for an error thrown by NodeJS", async () => {
    // Arrange
    const nodeJsError = await fs.promises.readFile("does not exist").catch((error) => error)

    // Act & Assert
    expect(isNodeJSError(nodeJsError)).toBe(true)
    expect((nodeJsError as NodeJS.ErrnoException).code).toBe("ENOENT")
  })

  it("should return true for an error thrown in NodeJS", async () => {
    // Arrange
    const nodeJsError = new Error("boom")

    // Act & Assert
    expect(isNodeJSError(nodeJsError)).toBe(true)
  })

  it.each(["not an error", "Error", new (class Error {})(), undefined, null, false, true])(
    "should return false for not an error (%o)",
    (error) => {
      // Act & Assert
      expect(isNodeJSError(error)).toBe(false)
    },
  )
})
