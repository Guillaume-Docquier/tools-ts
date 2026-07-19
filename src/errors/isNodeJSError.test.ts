import * as fs from "node:fs"
import { describe, it, expect } from "vitest"
import { isNodeJSError } from "./isNodeJSError.js"

describe("isNodeJSError", () => {
  it("should return true for an error thrown by NodeJS", async () => {
    // Arrange
    const nodeJsError = await fs.promises.readFile("does not exist").catch((error) => error)

    // Act & Assert
    expect(isNodeJSError(nodeJsError)).toBe(true)
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- That's just because vitest's matchers can be type guards
    expect((nodeJsError as NodeJS.ErrnoException).code).toBe("ENOENT")
  })

  it("should return true for an error thrown in NodeJS", async () => {
    // Arrange
    const nodeJsError = new Error("boom")

    // Act & Assert
    expect(isNodeJSError(nodeJsError)).toBe(true)
  })

  // oxlint-disable-next-line typescript/no-extraneous-class -- The contents of the class doesn't matter here
  it.each(["not an error", "Error", new (class Error {})(), undefined, null, false, true])(
    "should return false for not an error (%o)",
    (error) => {
      // Act & Assert
      expect(isNodeJSError(error)).toBe(false)
    },
  )
})
