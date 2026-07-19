import type { TextFormatter } from "@logtape/logtape"
import type { LoggerContext } from "../log-context/LoggerContext.js"

/**
 * Formats the log entry as a json line string.
 */
export const jsonLineFormatter: TextFormatter = (logRecord) => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This is intended to be used with our logger, which guarantees this
  const { scopes, ...context } = logRecord.properties as LoggerContext

  return JSON.stringify({
    ...context,
    timestamp: new Date(logRecord.timestamp).toISOString(),
    level: logRecord.level.toUpperCase(),
    scope: scopes.length > 0 ? scopes.join(" ") : undefined,
    message: logRecord.rawMessage,
  })
}
