import type { Logger } from "./Logger.js"

const ROOT_LOGGER_SYMBOL = Symbol.for("root-logger")
const ROOT_LOGGER_IS_CONFIGURED_SYMBOL = Symbol.for("root-logger-is-configured")

/**
 * We will keep a reference to all the loggers that are created before {@link Logger.configure} is called so we can finalize their configuration.
 */
const UNCONFIGURED_LOGGERS_SYMBOL = Symbol.for("unconfigured-loggers")

interface GlobalRootLoggerRegistry {
  [ROOT_LOGGER_SYMBOL]?: Logger
  [ROOT_LOGGER_IS_CONFIGURED_SYMBOL]?: boolean
  [UNCONFIGURED_LOGGERS_SYMBOL]?: Logger[]
}

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The registry uses globally unique symbol keys, and every write is controlled by this module
const globalRootLoggerRegistry = globalThis as GlobalRootLoggerRegistry

export function getRootLogger(): Logger | undefined {
  return globalRootLoggerRegistry[ROOT_LOGGER_SYMBOL]
}

export function setRootLogger(rootLogger: Logger): void {
  globalRootLoggerRegistry[ROOT_LOGGER_SYMBOL] = rootLogger
}

/**
 * Checks if the root logger has been configured already.
 */
function isRootLoggerConfigured(): boolean {
  return globalRootLoggerRegistry[ROOT_LOGGER_IS_CONFIGURED_SYMBOL] === true
}

/**
 * Set if the logger was configured.
 * This will release all the unconfigured loggers, as they should either be configured now or garbage collectable.
 */
function setRootLoggerConfigured(isConfigured: boolean): void {
  globalRootLoggerRegistry[ROOT_LOGGER_IS_CONFIGURED_SYMBOL] = isConfigured
  globalRootLoggerRegistry[UNCONFIGURED_LOGGERS_SYMBOL] = []
}
/**
 * Gets or creates the unconfigured loggers array.
 */
function getUnconfiguredLoggers(): Logger[] {
  let unconfiguredLoggers = globalRootLoggerRegistry[UNCONFIGURED_LOGGERS_SYMBOL]
  if (unconfiguredLoggers === undefined) {
    unconfiguredLoggers = []
    globalRootLoggerRegistry[UNCONFIGURED_LOGGERS_SYMBOL] = unconfiguredLoggers
  }

  return unconfiguredLoggers
}

/**
 * Registers a logger if the root logger is not yet configured so we can finish configuring them later with {@link configureUnconfiguredLoggers}.
 */
export function registerLoggerIfNotConfigured(logger: Logger): Logger {
  if (!isRootLoggerConfigured()) {
    getUnconfiguredLoggers().push(logger)
  }

  return logger
}

/**
 * Your callback must configure the loggers properly, as they will all be released afterwards.
 */
export function configureUnconfiguredLoggers(callback: (unconfiguredLoggers: Logger[]) => void): void {
  callback(getUnconfiguredLoggers())
  setRootLoggerConfigured(true)
}

export function unconfigureRootLogger(): void {
  setRootLoggerConfigured(false)
}
