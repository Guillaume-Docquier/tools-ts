import type { ConsoleFormatter } from "@logtape/logtape"
import type { LoggerContext } from "../log-context/LoggerContext.js"

/**
 * Formats the log entry as a {@link ConsoleLogFormat} followed by the structured data context.
 * The message context is not stringified, so in browsers you'll be able to expand/collapse the data and have colorized output.
 */
export const prettyConsoleFormatter: ConsoleFormatter = (logRecord) => {
  const { scopes, ...context } = logRecord.properties as LoggerContext

  const consoleArgs: unknown[] = [
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
  ]

  // If we always add the context, log lines with empty context log "{}"
  if (Object.keys(context).length > 0) {
    consoleArgs.push(context)
  }

  return consoleArgs
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
 * The log format for the default {@link prettyConsoleFormatter}
 */
type ConsoleLogFormat = `${Time} ${Level}${OptionalScope}: ${Message}`
