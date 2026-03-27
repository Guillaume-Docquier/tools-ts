import { describe, it, afterEach, expect, vi } from "vitest"
import { reset } from "@logtape/logtape"
import { Logger } from "../../logging/Logger.js"
import { createConsoleLogSink } from "./ConsoleLogSink.js"

describe("ConsoleLogSink", () => {
  describe("createConsoleLogSink", () => {
    afterEach(async () => {
      await reset()
    })

    it.each(["debug", "info", "error"] as const)("should log %s messages to the console when used with Logger", async (level) => {
      // Arrange
      const consoleSpy = vi.spyOn(console, level)
      const logger = await Logger.configure({
        sinks: {
          console: createConsoleLogSink(),
        },
      })

      const message = "my-test-message"
      const context = { extra: "my-context-data" }
      const childScope = "child-scope"

      const childLogger = logger.child({ scope: childScope })

      // Act
      childLogger[level](message, context)

      // Assert
      const expectedContext = expect.objectContaining(context)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(level.toUpperCase()), expectedContext)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(childScope), expectedContext)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(message), expectedContext)
    })
  })
})
