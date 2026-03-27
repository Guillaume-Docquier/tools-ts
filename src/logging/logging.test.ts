import type { LogContextProvider } from "./log-context/LogContextProvider.js"
import type { LogContext } from "./log-context/LogContext.js"
import { Logger } from "./Logger.js"
import { createConsoleLogSink } from "./sink/ConsoleLogSink.js"
import { configure, getLogger, reset } from "@logtape/logtape"
import { describe, afterEach, it } from "vitest"

// These tests showcase what Logger can do and how it compares to the native lib in terms of performance.
// To get real benchmark results, run each test individually.
// Otherwise the JIT makes the first tests slower than the last tests.
// These are not strong or reliable benchmarks, but they give us an order of magnitude in terms of performance overhead
describe("logging", () => {
  afterEach(async () => {
    await reset()
  })

  describe("Logger", () => {
    it.each([{ nonBlocking: false }, { nonBlocking: true }])(
      "should be able to set the context after creating the logger (nonBlocking: $nonBlocking)",
      async ({ nonBlocking }) => {
        const init = performance.now()
        const contextProvider = new UserLogContextProvider()
        const rootLogger = await Logger.configure({
          sinks: {
            console: createConsoleLogSink({ nonBlocking }),
          },
          contextProviders: [contextProvider],
        })

        const warm = performance.now()
        rootLogger.info("warm up")
        const log = performance.now()

        const initLogger = rootLogger.child({ scope: "init" })
        initLogger.info("start init") // no user, as expected
        await someInitCode(initLogger) // no user, as expected

        const user = await loadUser()

        // Setting the context
        contextProvider.user = user
        rootLogger.info("this will have user") // has the user

        await someInitCode(initLogger) // has the user
        initLogger.info("end init") // has the user

        const feature1Logger = rootLogger.child({ scope: "feature1" })
        feature1Logger.info("some feature work with admin true") // has isAdmin === true

        user.isAdmin = false

        feature1Logger.info("some feature work with admin false") // has isAdmin === false

        const end = performance.now()

        console.log({
          // blocking | non-blocking
          init: warm - init, // 2.97ms | 2.88ms
          warm: log - warm, // 0.26ms | 0.13ms
          log: end - log, // 2.69ms | 0.52ms
        })

        // Output
        // [15:25:44.955] INFO: LogTape loggers are configured.  Note that LogTape itself uses the meta logger, which has category {metaLoggerCategory}.  The meta logger purposes to log internal errors such as sink exceptions.  If you are seeing this message, the meta logger is automatically configured.  It's recommended to configure the meta logger with a separate sink so that you can easily notice if logging itself fails or is misconfigured.  To turn off this message, configure the meta logger with higher log levels than {dismissLevel}.  See also <https://logtape.org/manual/categories#meta-logger>. { metaLoggerCategory: [ 'logtape', 'meta' ], dismissLevel: 'info' }
        // [15:25:44.958] INFO: warm up { user: null }
        // [15:25:44.959] INFO (init): start init { user: null }
        // [15:25:44.959] INFO (init): some init { user: null }
        // [15:25:44.960] INFO: this will have user { user: { id: 1, isAdmin: true } }
        // [15:25:44.961] INFO (init): some init { user: { id: 1, isAdmin: true } }
        // [15:25:44.961] INFO (init): end init { user: { id: 1, isAdmin: true } }
        // [15:25:44.962] INFO (feature1): some feature work with admin true { user: { id: 1, isAdmin: true } }
        // [15:25:44.963] INFO (feature1): some feature work with admin false { user: { id: 1, isAdmin: false } }
      },
    )
  })

  describe("Native LogTape", () => {
    it("is not able to set the context after creating the logger", async () => {
      const init = performance.now()
      await configure({
        sinks: {
          console: createConsoleLogSink(),
        },
        loggers: [{ category: [], sinks: ["console"] }],
      })

      const rootLogger = getLogger("root").with({ scopes: [], user: null })

      const warm = performance.now()
      rootLogger.info("warm up")
      const log = performance.now()

      const initLogger = rootLogger.getChild("init").with({ scopes: ["init"] })
      initLogger.info("start init") // no user, as expected
      await someInitCode(initLogger) // no user, as expected

      const user = await loadUser()

      // Setting the context
      // We only want to log a subset of data from the user
      rootLogger.with({ user: { id: user.id, isAdmin: user.isAdmin } }).info("this will have user") // has the user

      await someInitCode(initLogger) // should have the user
      initLogger.info("end init") // should have the user

      const feature1Logger = rootLogger.getChild("feature1").with({ scopes: ["feature1"] })
      feature1Logger.info("some feature work with admin true") // should have isAdmin === true

      user.isAdmin = false

      feature1Logger.info("some feature work with admin false") // should have isAdmin === false

      const end = performance.now()

      console.log({
        init: warm - init, // 3.64ms
        warm: log - warm, // 0.22ms
        log: end - log, // 2.78ms
      })

      // Output
      // [15:29:49.182] INFO: LogTape loggers are configured.  Note that LogTape itself uses the meta logger, which has category {metaLoggerCategory}.  The meta logger purposes to log internal errors such as sink exceptions.  If you are seeing this message, the meta logger is automatically configured.  It's recommended to configure the meta logger with a separate sink so that you can easily notice if logging itself fails or is misconfigured.  To turn off this message, configure the meta logger with higher log levels than {dismissLevel}.  See also <https://logtape.org/manual/categories#meta-logger>. { metaLoggerCategory: [ 'logtape', 'meta' ], dismissLevel: 'info' }
      // [15:29:49.183] INFO: warm up { user: null }
      // [15:29:49.183] INFO (init): start init { user: null }
      // [15:29:49.184] INFO (init): some init { user: null }
      // [15:29:49.184] INFO: this will have user { user: { id: 1, isAdmin: true } }
      // [15:29:49.185] INFO (init): some init { user: null }
      // [15:29:49.185] INFO (init): end init { user: null }
      // [15:29:49.186] INFO (feature1): some feature work with admin true { user: null }
      // [15:29:49.186] INFO (feature1): some feature work with admin false { user: null }
    })
  })
})

type User = { id: number; isAdmin: boolean; sensitiveData: string; junkData: string }
type LogUser = { id: number; isAdmin: boolean }

async function loadUser(): Promise<User> {
  return { id: 1, isAdmin: true, sensitiveData: "pii", junkData: "junk" }
}

async function someInitCode(logger: { info: (message: string) => void }): Promise<void> {
  logger.info("some init")
}

class UserLogContextProvider implements LogContextProvider {
  public user?: User

  public getContext(): LogContext {
    const user: LogUser | null = this.user === undefined ? null : { id: this.user.id, isAdmin: this.user.isAdmin }

    return {
      user,
    }
  }
}
