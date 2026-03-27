import type { TextFormatter } from "@logtape/logtape"
import type { LoggerContext } from "../log-context/LoggerContext.js"

/**
 * Formats the log entry as a json line string.
 */
export const jsonLineFormatter: TextFormatter = (logRecord) => {
  const { scopes, ...context } = logRecord.properties as LoggerContext

  return formatConsoleMessage({
    timestamp: logRecord.timestamp,
    level: logRecord.level,
    scopes,
    // We have to cast because we use LogTape's types directly instead of providing our own adapters.
    // LogTape supports template literals, but we don't.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals to learn more about template literals.
    // We don't validate for performance reasons. We compensate with tests.
    message: logRecord.rawMessage as string,
    context,
  })
}

function formatConsoleMessage(data: {
  timestamp: number
  scopes: readonly string[]
  level: string
  message: string
  context: Record<string, unknown>
}): string {
  return JSON.stringify({
    ...data.context,
    timestamp: new Date(data.timestamp).toISOString(),
    level: data.level.toUpperCase(),
    scope: data.scopes.length > 0 ? data.scopes.join(" ") : undefined,
    message: data.message,
  })
}
