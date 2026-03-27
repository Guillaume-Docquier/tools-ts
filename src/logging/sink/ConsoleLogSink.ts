import type { LogSink } from "./LogSink.js"
import { getConsoleSink, type ConsoleSinkOptions, type ConsoleFormatter } from "@logtape/logtape"
import type { LoggerContext } from "../log-context/LoggerContext.js"

/**
 * Creates a log sink to output to the console.
 * You can provide a custom formatter, though the default {@link consoleFormatter} should be enough.
 * You can also decide if logs should be blocking (main thread) or non blocking for better performance
 */
export function createConsoleLogSink({
  formatter = consoleFormatter,
  nonBlocking = false,
}: {
  /**
   * The console message formatter
   */
  formatter?: ConsoleSinkOptions["formatter"]
  /**
   * When nonBlocking is true, logs will be processed at a later time to avoid using resources that your application needs.
   * You might see your logs with a small delay because of this, but the timestamps will be accurate.
   */
  nonBlocking?: boolean
} = {}): LogSink {
  return getConsoleSink({
    formatter,
    nonBlocking,
  })
}

/**
 * Formats the log entry as a {@link ConsoleLogFormat} followed by the structured data context.
 * The message context is not stringified, so in browsers you'll be able to expand/collapse the data and have colorized output.
 */
const consoleFormatter: ConsoleFormatter = (logRecord) => {
  const { scopes, ...context } = logRecord.properties as LoggerContext

  return [
    formatConsoleMessage({
      timestamp: logRecord.timestamp,
      level: logRecord.level,
      scopes,
      // We have to cast because we use LogTape's types directly instead of providing our own adapters.
      // LogTape supports template literals, but we don't.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals to learn more about template literals.
      // We don't validate for performance reasons. We compensate with tests.
      message: logRecord.rawMessage as string,
    }),
    context,
  ]
}

function formatConsoleMessage(data: { timestamp: number; scopes: readonly string[]; level: string; message: string }): ConsoleLogFormat {
  const date = new Date(data.timestamp)

  const time: Time = `[${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date
    .getUTCSeconds()
    .toString()
    .padStart(2, "0")}.${date.getUTCMilliseconds().toString().padStart(3, "0")}]`

  const level: Level = data.level.toUpperCase()
  const optionalScope: OptionalScope = data.scopes.length > 0 ? ` (${data.scopes.join(" ")})` : ""
  const message: Message = data.message

  return `${time} ${level}${optionalScope}: ${message}`
}

type Time = `[${string}:${string}:${string}.${string}]`
type Level = string
type OptionalScope = ` (${string})` | ``
type Message = string

/**
 * The log format for the default {@link consoleFormatter}
 */
type ConsoleLogFormat = `${Time} ${Level}${OptionalScope}: ${Message}`
