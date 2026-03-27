import { describe, it, afterEach, expect, vi, test } from "vitest"
import { reset } from "@logtape/logtape"
import { Logger } from "../Logger.js"
import { createConsoleLogSink } from "./ConsoleLogSink.js"
import { prettyConsoleFormatter } from "../formatter/prettyConsoleFormatter.js"

describe("ConsoleLogSink", () => {
  describe("createConsoleLogSink", () => {
    afterEach(async () => {
      await reset()
    })

    describe("prettyConsoleFormatter", () => {
      it.each(["debug", "info", "error"] as const)(
        "should log %s messages to the console with context when used with Logger",
        async (level) => {
          // Arrange
          const consoleSpy = vi.spyOn(console, level)
          const logger = await Logger.configure({
            sinks: {
              console: createConsoleLogSink({ formatter: prettyConsoleFormatter, nonBlocking: false }),
            },
          })

          const message = "my-test-message"
          const context = { extra: "my-context-data" }
          const childScope = "child-scope"

          const childLogger = logger.child({ scope: childScope })

          // Act
          childLogger[level](message, context)

          // Assert
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`^\\[.*] ${level.toUpperCase()} \\(child-scope\\): my-test-message$`)),
            context,
          )
        },
      )

      it("should log an empty scope when none is provided", async () => {
        // Arrange
        const consoleSpy = vi.spyOn(console, "info")
        const logger = await Logger.configure({
          sinks: {
            console: createConsoleLogSink({ formatter: prettyConsoleFormatter, nonBlocking: false }),
          },
        })

        const message = "my-test-message"
        const context = { extra: "my-context-data" }

        // Act
        logger.info(message, context)

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/^\[.*] INFO: my-test-message$/), context)
      })
    })

    it("uses JSON format and redacts sensitive fields by default", async () => {
      const consoleSpy = vi.spyOn(console, "info")
      const logger = await Logger.configure({
        sinks: { console: createConsoleLogSink({ nonBlocking: false }) },
      })

      logger.info("hello", { normalField: "visible", cookie: "secret" })

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(String))
      const [jsonLogLine] = consoleSpy.mock.calls[0] as [string]
      expect(JSON.parse(jsonLogLine)).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        message: "hello",
        cookie: "[REDACTED]",
        normalField: "visible",
      })
    })

    it("allows overriding the formatter", async () => {
      const consoleSpy = vi.spyOn(console, "info")
      const customFormatter = vi.fn().mockReturnValue(["custom-output"])
      const logger = await Logger.configure({
        sinks: { console: createConsoleLogSink({ nonBlocking: false, formatter: customFormatter }) },
      })

      logger.info("hello")

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith("custom-output")
    })

    it("allows disabling redaction", async () => {
      const consoleSpy = vi.spyOn(console, "info")
      const logger = await Logger.configure({
        sinks: { console: createConsoleLogSink({ nonBlocking: false, redaction: { enabled: false } }) },
      })

      logger.info("hello", { cookie: "visible because redaction disabled" })

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(String))
      const [jsonLogLine] = consoleSpy.mock.calls[0] as [string]
      expect(JSON.parse(jsonLogLine)).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        message: "hello",
        cookie: "visible because redaction disabled",
      })
    })

    it("allows customising redaction field patterns", async () => {
      const consoleSpy = vi.spyOn(console, "info")
      const logger = await Logger.configure({
        sinks: {
          console: createConsoleLogSink({
            nonBlocking: false,
            redaction: { enabled: true, fieldPatterns: [/myCustomSecret/i] },
          }),
        },
      })

      logger.info("hello", { myCustomSecret: "value", normalField: "visible", cookie: "visible because overridden" })

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(String))
      const [jsonLogLine] = consoleSpy.mock.calls[0] as [string]
      expect(JSON.parse(jsonLogLine)).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        message: "hello",
        myCustomSecret: "[REDACTED]",
        normalField: "visible",
        cookie: "visible because overridden",
      })
    })

    it("allows customising the redaction action", async () => {
      const consoleSpy = vi.spyOn(console, "info")
      const logger = await Logger.configure({
        sinks: {
          console: createConsoleLogSink({
            nonBlocking: false,
            redaction: { enabled: true, action: "delete" },
          }),
        },
      })

      logger.info("hello", { password: "secret" })

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(String))
      const [jsonLogLine] = consoleSpy.mock.calls[0] as [string]
      expect(JSON.parse(jsonLogLine)).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        message: "hello",
      })
    })

    test("context cannot override default fields", async () => {
      const consoleSpy = vi.spyOn(console, "info")
      const logger = await Logger.configure({
        sinks: { console: createConsoleLogSink({ nonBlocking: false }) },
      })

      logger.info("hello", { message: "this gets lost", timestamp: "this gets lost", level: "this gets lost" })

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(String))
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("this gets lost"))
      const [jsonLogLine] = consoleSpy.mock.calls[0] as [string]
      expect(JSON.parse(jsonLogLine)).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        message: "hello",
      })
    })
  })
})
