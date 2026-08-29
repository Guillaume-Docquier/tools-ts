import { type LogRecord } from "@logtape/logtape"
import { describe, it, afterEach, expect } from "vitest"
import { configureUnconfiguredLoggers } from "./GlobalRootLoggerRegistry.js"
import type { LogContext } from "./log-context/LogContext.js"
import type { LogContextProvider } from "./log-context/LogContextProvider.js"
import { Logger } from "./Logger.js"
import type { LogSink } from "./sink/LogSink.js"

describe("Logger", () => {
  afterEach(async () => {
    await Logger.reset()
  })

  describe("configure", () => {
    it("should create the singleton instance if called before get", async () => {
      // Act
      const rootLogger = await Logger.configure({ sinks: {} })
      const alsoRootLogger = Logger.get()

      // Assert
      expect(rootLogger).toBeDefined()
      expect(rootLogger).toBe(alsoRootLogger)
    })

    it("should return the singleton instance on each call", async () => {
      // Act
      const rootLogger = await Logger.configure({ sinks: {} })
      await Logger.reset()
      const alsoRootLogger = await Logger.configure({ sinks: {} })

      // Assert
      expect(rootLogger).toBeDefined()
      expect(rootLogger).toBe(alsoRootLogger)
    })

    it("should propagate context to all loggers created before configuring", async () => {
      // Arrange
      const rootLogger = Logger.get()
      const child1 = rootLogger.child({ scope: "child1" })
      const child2 = rootLogger.child({ scope: "child2" })
      const child3 = child2.child({ scope: "child3" })

      const inMemorySink = createInMemorySink()
      const context = { staticContext: "static-context" }
      const contextProvider = new AnyLogContextProvider({ contextProvider: "context-provider" })

      // Act
      await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context,
        contextProviders: [contextProvider],
      })

      // Assert
      rootLogger.info("root")
      child1.info("child1")
      child2.info("child2")
      child3.info("child3")

      const expectedContext = { ...context, ...contextProvider.context }
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({ level: "info", message: "root", scopes: [], context: expectedContext }),
        createLogRecord({ level: "info", message: "child1", scopes: ["child1"], context: expectedContext }),
        createLogRecord({ level: "info", message: "child2", scopes: ["child2"], context: expectedContext }),
        createLogRecord({ level: "info", message: "child3", scopes: ["child2", "child3"], context: expectedContext }),
      ])

      configureUnconfiguredLoggers((unconfiguredLoggers) => {
        expect(unconfiguredLoggers).toStrictEqual([])
      })
    })
  })

  describe("reset", () => {
    it("should reset all sinks until reconfiguration without breaking existing loggers", async () => {
      // Arrange
      const inMemorySink = createInMemorySink()
      const context = { initialContext: "initial-context" }
      const contextProvider = new AnyLogContextProvider({ contextProvider: "context-provider" })
      const logger = await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context,
        contextProviders: [contextProvider],
      })

      // Act
      logger.info("before reset")
      await Logger.reset()
      logger.info("after reset, will be lost")
      await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context,
        contextProviders: [contextProvider],
      })
      logger.info("after re-configure")

      // Assert
      const expectedContext = { ...context, ...contextProvider.context }
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({ level: "info", message: "before reset", context: expectedContext }),
        createLogRecord({ level: "info", message: "after re-configure", context: expectedContext }),
      ])
    })

    it("should reset the root logger context", async () => {
      // Arrange
      const inMemorySink = createInMemorySink()
      const logger = await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context: { static: "static" },
        contextProviders: [new AnyLogContextProvider({ dynamic: "dynamic" })],
      })

      // Act
      await Logger.reset()

      // If the root logger context was reset properly, the child logger should inherit no context at all
      const childLogger = logger.child({ scope: "child" })

      await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
      })

      childLogger.info("after re-configure")

      // Assert
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({
          level: "info",
          context: {},
          message: expect.any(String),
          scopes: expect.any(Array),
        }),
      ])
    })
  })

  describe("get", () => {
    it("should return the singleton instance if called before configure", async () => {
      // Act
      const rootLogger = Logger.get()
      const alsoRootLogger = await Logger.configure({ sinks: {} })

      // Assert
      expect(rootLogger).toBeDefined()
      expect(rootLogger).toBe(alsoRootLogger)
    })

    it("should return the singleton instance on each call", () => {
      // Act
      const rootLogger = Logger.get()
      const alsoRootLogger = Logger.get()

      // Assert
      expect(rootLogger).toBeDefined()
      expect(rootLogger).toBe(alsoRootLogger)
    })
  })

  describe("child", () => {
    it("should inherit the parent context", async () => {
      // Arrange
      const inMemorySink = createInMemorySink()
      const parentStaticContext = { parentStaticContext: "parent-static-context" }
      const parentContextProvider = new AnyLogContextProvider()
      const parentLogger = await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context: parentStaticContext,
        contextProviders: [parentContextProvider],
      })

      const childScope = "child-scope"
      const message = "test message"
      const parentContext = "parent-context"
      const childContext = "child-context"
      const childStaticContext = { childStaticContext: "child-static-context" }

      const childContextProvider = new AnyLogContextProvider()
      const childLogger = parentLogger.child({
        scope: childScope,
        context: childStaticContext,
        contextProviders: [childContextProvider],
      })

      // Act
      parentContextProvider.context.parentContext = parentContext
      childContextProvider.context.childContext = childContext
      childLogger.info(message)

      // Assert
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({
          level: "info",
          message,
          context: { ...parentStaticContext, ...childStaticContext, parentContext, childContext },
          scopes: expect.any(Array), // Not important for this test
        }),
      ])
    })

    it("should inherit the parent scopes", async () => {
      // Arrange
      const inMemorySink = createInMemorySink()
      const rootLogger = await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
      })

      const parentScope = "parent-scope"
      const parentLogger = rootLogger.child({ scope: parentScope })

      const childScope = "child-scope"
      const childLogger = parentLogger.child({ scope: childScope })

      const message = "test message"

      // Act
      childLogger.debug(message)

      // Assert
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({
          level: "debug",
          message,
          scopes: [parentScope, childScope],
          context: {},
          timestamp: expect.any(Number),
        }),
      ])
    })

    it("should not register loggers if the root logger is configured", async () => {
      // Arrange
      const rootLogger = await Logger.configure({ sinks: {} })

      // Act
      rootLogger.child({ scope: "child1" })
      rootLogger.child({ scope: "child2" }).child({ scope: "child3" })

      // Assert
      configureUnconfiguredLoggers((unconfiguredLoggers) => {
        expect(unconfiguredLoggers).toStrictEqual([])
      })
    })
  })

  describe("context", () => {
    it("should static context should not be mutated", async () => {
      // Arrange
      const context = { context: "data" }
      const inMemorySink = createInMemorySink()
      const logger = await Logger.configure({
        sinks: {
          // It's important to have a sink in case LogTape skips some processing when there are none
          memory: inMemorySink.sink,
        },
        context,
      })

      // Act
      logger.info("hello", { more: "context" })

      // Assert
      expect(context).toStrictEqual({ context: "data" })
    })

    it("should be prioritized in the order: message < dynamic < static < reserved", async () => {
      // Arrange
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- we're cheating to test scopes
      const messageContext = { message: "message", dynamic: "message", context: "message", scopes: ["message"] } as unknown as LogContext
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- we're cheating to test scopes
      const dynamicContext = { dynamic: "dynamic", context: "dynamic", scopes: ["dynamic"] } as unknown as LogContext
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- we're cheating to test scopes
      const staticContext = { context: "context", scopes: ["context"] } as unknown as LogContext

      const contextProvider = new AnyLogContextProvider(dynamicContext)
      const inMemorySink = createInMemorySink()
      const logger = await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context: staticContext,
        contextProviders: [contextProvider],
      })

      // Act
      logger.info("hello", messageContext)

      // Assert
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({
          level: "info",
          context: { message: "message", dynamic: "dynamic", context: "context" },
          scopes: [],
          message: expect.any(String),
        }),
      ])
    })

    it("should be prioritized in the order: child < parent", async () => {
      // Arrange
      const parent = {
        dynamicContext: { dynamic: "parent" },
        staticContext: { static: "parent" },
      }

      const child = {
        dynamicContext: { dynamic: "child" },
        staticContext: { static: "child" },
      }

      const inMemorySink = createInMemorySink()
      const logger = await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context: parent.staticContext,
        contextProviders: [new AnyLogContextProvider(parent.dynamicContext)],
      })

      const childLogger = logger.child({
        scope: "child",
        context: child.staticContext,
        contextProviders: [new AnyLogContextProvider(child.dynamicContext)],
      })

      // Act
      childLogger.info("hello")

      // Assert
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({
          level: "info",
          context: { static: "parent", dynamic: "parent" },
          message: expect.any(String),
          scopes: expect.any(Array),
        }),
      ])
    })

    it("should be prioritized in the order: child < parent when child is created before the root logger is configured", async () => {
      // Arrange
      const parent = {
        dynamicContext: { dynamic: "parent" },
        staticContext: { static: "parent" },
      }

      const child = {
        dynamicContext: { dynamic: "child" },
        staticContext: { static: "child" },
      }

      const childLogger = Logger.get().child({
        scope: "child",
        context: child.staticContext,
        contextProviders: [new AnyLogContextProvider(child.dynamicContext)],
      })

      const inMemorySink = createInMemorySink()
      await Logger.configure({
        sinks: {
          memory: inMemorySink.sink,
        },
        context: parent.staticContext,
        contextProviders: [new AnyLogContextProvider(parent.dynamicContext)],
      })

      // Act
      childLogger.info("hello")

      // Assert
      expect(inMemorySink.records).toStrictEqual([
        createLogRecord({
          level: "info",
          context: { static: "parent", dynamic: "parent" },
          message: expect.any(String),
          scopes: expect.any(Array),
        }),
      ])
    })
  })

  it.each(["debug", "info", "error"] as const)("should log %s messages", async (level) => {
    // Arrange
    const inMemorySink = createInMemorySink()
    const logger = await Logger.configure({
      sinks: {
        memory: inMemorySink.sink,
      },
    })

    const message = "my-test-message"
    const context = { extra: "my-context-data" }
    const childScope = "child-scope"

    const childLogger = logger.child({ scope: childScope })

    // Act
    childLogger[level](message, context)

    // Assert
    expect(inMemorySink.records).toStrictEqual([
      createLogRecord({
        level,
        message,
        scopes: [childScope],
        context,
      }),
    ])
  })
})

class AnyLogContextProvider implements LogContextProvider {
  public readonly context: LogContext

  public constructor(context: LogContext = {}) {
    this.context = context
  }

  public getContext(): LogContext {
    return this.context
  }
}

function createInMemorySink(): { sink: LogSink; records: LogRecord[] } {
  const records: LogRecord[] = []
  const sink: LogSink = (record) => {
    records.push(record)
  }

  return { sink, records }
}

function createLogRecord({
  level,
  message,
  scopes = [],
  context = {},
  timestamp = expect.any(Number),
}: {
  message: string
  level: "debug" | "info" | "error"
  scopes?: string[]
  context?: LogContext
  timestamp?: number
}): LogRecord {
  return {
    category: [],
    level,
    message: [message],
    properties: {
      scopes,
      ...context,
    },
    rawMessage: message,
    timestamp,
  }
}
