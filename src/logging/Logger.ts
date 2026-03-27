import type { LogSink } from "./sink/LogSink.js"
import type { LogContextProvider } from "./log-context/LogContextProvider.js"
import type { LogContext } from "./log-context/LogContext.js"
import { configure, getLogger, reset, type Logger as LogTapeLogger } from "@logtape/logtape"
import type { LoggerContext } from "./log-context/LoggerContext.js"
import {
  getRootLogger,
  setRootLogger,
  registerLoggerIfNotConfigured,
  configureUnconfiguredLoggers,
  unconfigureRootLogger,
} from "./GlobalRootLoggerRegistry.js"

/**
 * The fully featured logger for .
 * You can learn more about its capabilities in the {@link https://github.com/Co/tech-toolbox/tree/main/tech-toolbox/docs/logging.md|documentation}
 */
export class Logger {
  /**
   * The backing LogTape logger.
   */
  private readonly logger: LogTapeLogger

  /**
   * Tags to identify the logger's scope.
   */
  private readonly scopes: readonly string[]

  /**
   * Static log context.
   */
  private staticContext: LogContext | undefined

  /**
   * Dynamic log context providers.
   */
  private contextProviders: readonly LogContextProvider[]

  /**
   * Configures Logger and returns a root logger that you can start using.
   * Only the application should call this, and only once.
   * If you are logging from a library, you should get the root logger via {@link Logger.get}
   *
   * @example
   * ```ts
   * const userService = new UserService()
   * const contextProvider = new LogContextProvider(userService)
   * const rootLogger = await Logger.configure({
   *   sinks: {
   *     console: createConsoleLogSink({ nonBlocking }),
   *   },
   *   context: { some: "static-data" },
   *   contextProviders: [contextProvider],
   * })
   *
   * rootLogger.debug("hello", { someData: "world" })
   * // [15:25:44.958] DEBUG: hello { someData: "world", some: "static-data", user: null }
   *
   * await userService.fetchUser
   *
   * rootLogger.info("init is done!")
   * // [15:25:44.958] INFO: init is done! { some: "static-data", user: { id: 1, isAdmin: false }}
   * ```
   */
  public static async configure({
    sinks,
    context,
    contextProviders = [],
  }: {
    /**
     * The log destinations. Can be the console, a file, sentry, etc.
     * We offer sinks that you'll most likely need, but you can implement your own.
     * Each sink is mapped to a name. The name is cosmetic and doesn't really matter.
     */
    sinks: Record<string, LogSink>
    /**
     * Static context to be included in every log.
     * Use this for data that doesn't change over time, otherwise a {@link LogContextProvider} might be more suitable.
     */
    context?: LogContext
    /**
     * The {@link LogContextProvider}s for the root logger.
     * Child loggers will inherit the root context, so this is useful for data that you want to attach to all the logs.
     */
    contextProviders?: LogContextProvider[]
  }): Promise<Logger> {
    await configure({
      sinks,
      loggers: [
        { category: [], sinks: Object.keys(sinks) },
        { category: ["logtape", "meta"], lowestLevel: "warning" }, // disables the logtape meta info logs
      ],
    })

    const rootLogger = Logger.get()
    rootLogger.staticContext = context
    rootLogger.contextProviders = contextProviders

    // Propagate context.
    // This is safe because the intended design is for when unconfigured loggers are created before the root logger.
    // If someone is calling reset/configure/reset with different contexts on the root, then the context might grow, but they shouldn't be doing that.
    configureUnconfiguredLoggers((unconfiguredLoggers) => {
      for (const unconfiguredLogger of unconfiguredLoggers) {
        unconfiguredLogger.staticContext = { ...unconfiguredLogger.staticContext, ...rootLogger.staticContext }
        unconfiguredLogger.contextProviders = [...unconfiguredLogger.contextProviders, ...rootLogger.contextProviders]
      }
    })

    return rootLogger
  }

  /**
   * Resets the logger configuration.
   * Existing loggers will still be valid, given that `configure` is eventually called again.
   * Mainly useful for tests. Applications shouldn't really need to reset the logger.
   */
  public static async reset(): Promise<void> {
    await reset()

    const rootLogger = Logger.get()
    rootLogger.staticContext = {}
    rootLogger.contextProviders = []

    unconfigureRootLogger()
  }

  /**
   * Gets the root logger. This is the recommended API for libraries.
   * Instead of calling {@link Logger.configure}, libraries should get the root logger with this method.
   *
   * The root logger can be used immediately.
   * When the application eventually configures the root logger with {@link Logger.configure}, the context and sinks will be propagated to all loggers.
   *
   * @example
   * ```ts
   * // In your library
   * const libLogger = Logger.get().child({ scope: "lib" })
   *
   * // Eventually, in the application
   * const contextProvider = new LogContextProvider()
   * await Logger.configure({
   *   sinks: {
   *     console: createConsoleLogSink(),
   *   },
   *   contextProviders: [contextProvider],
   * })
   *
   * contextProvider.user = await loadUser()
   *
   * // And then, in your library
   * libLogger.info("some lib feature work")
   * // [14:46:28.192] INFO (lib): some feature work { user: { id: 1, isAdmin: false } }
   * ```
   */
  public static get(): Logger {
    let rootLogger = getRootLogger()
    if (rootLogger === undefined) {
      rootLogger = new Logger({ logger: getLogger() })
      setRootLogger(rootLogger)
    }

    return rootLogger
  }

  private constructor({
    logger,
    scopes = [],
    context,
    contextProviders = [],
  }: {
    logger: LogTapeLogger
    scopes?: string[]
    context?: LogContext
    contextProviders?: LogContextProvider[]
  }) {
    this.logger = logger
    this.scopes = scopes
    this.staticContext = context
    this.contextProviders = contextProviders
  }

  /**
   * Creates a child logger for a scope.
   * A child logger will inherit the parent's context and scopes. The child scope will be appended to the parent scopes.
   * You can also provide additional {@link LogContextProvider}s if you want.
   */
  public child({
    scope,
    context,
    contextProviders = [],
  }: {
    /**
     * The scope for the child logger (eg. my-feature). This is just a string tag for you to query your logs later.
     * The scope will be appended to the parent logger's scopes.
     */
    scope: string
    /**
     * Static context to be included in every log.
     * Use this for data that doesn't change over time, otherwise a {@link LogContextProvider} might be more suitable.
     * This is additional to the parent logger's context.
     */
    context?: LogContext
    /**
     * The additional {@link LogContextProvider}s for the child logger.
     * These are additional to the parent logger's context providers.
     */
    contextProviders?: LogContextProvider[]
  }): Logger {
    return registerLoggerIfNotConfigured(
      new Logger({
        logger: this.logger,
        scopes: [...this.scopes, scope],
        context: { ...context, ...this.staticContext },
        contextProviders: [...contextProviders, ...this.contextProviders],
      }),
    )
  }

  /**
   * A debug level log.
   * A debug log is typically a verbose log at a very low abstraction level that helps debug issues that have been identified.
   */
  public debug(message: string, messageContext?: LogContext): void {
    this.logger.debug(message, this.getLogContext(messageContext))
  }

  /**
   * An info level log.
   * An info log is typically a log at a medium abstraction level that helps identify issues.
   */
  public info(message: string, messageContext?: LogContext): void {
    this.logger.info(message, this.getLogContext(messageContext))
  }

  /**
   * An error level log.
   * An error log is when an error that requires (immediate) attention happens.
   * If the error is okay/normal/expected, then you should not log as an error.
   */
  public error(message: string, messageContext?: LogContext): void {
    this.logger.error(message, this.getLogContext(messageContext))
  }

  private getLogContext(messageContext?: LogContext): LoggerContext {
    const dynamicContext = {}
    for (const provider of this.contextProviders) {
      Object.assign(dynamicContext, provider.getContext())
    }

    // The order matters for priority in case of key conflicts
    // message < dynamic < static < reserved
    return {
      ...messageContext,
      ...dynamicContext,
      ...this.staticContext,
      scopes: this.scopes,
    }
  }
}
