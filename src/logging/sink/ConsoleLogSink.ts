import type { LogSink } from "./LogSink.ts"
import { getConsoleSink, type ConsoleSinkOptions } from "@logtape/logtape"
import { redactByField, type FieldRedactionOptions } from "@logtape/redaction"
import { RECOMMENDED_LOG_REDACTION } from "../redaction.js"
import { jsonLineFormatter } from "../formatter/jsonLineFormatter.js"

type RedactionOptions = {
  enabled: boolean
  action?: FieldRedactionOptions["action"]
  fieldPatterns?: FieldRedactionOptions["fieldPatterns"]
}

/**
 * Creates a log sink to output to the console.
 * The default parameters are production-appropriate.
 * - `formatter` → {@link jsonLineFormatter} (structured JSON, one line per record)
 * - `nonBlocking` → `true` (logs are flushed off the hot path)
 * - `redaction` → enabled with {@link RECOMMENDED_LOG_REDACTION} settings
 *
 * You can override all of these to your liking if you have peculiar needs, or for a dev environment.
 *
 * @example
 * ```ts
 * import { createConsoleLogSink, jsonLineFormatter, prettyConsoleFormatter } from "@guillaume-docquier/tools-ts"
 *
 * // Zero-config: production ready, won't do the wrong thing
 * createConsoleLogSink()
 *
 * // Override just one option
 * createConsoleLogSink({ nonBlocking: false })
 *
 * // You can use a single set of options for dev and prod
 * const isProd = process.env.NODE_ENV === "production"
 * createConsoleLogSink({
 *   formatter: isProd ? jsonLineFormatter : prettyConsoleFormatter,
 *   redaction: {
 *     enabled: isProd
 *   },
 * })
 * ```
 */
export function createConsoleLogSink({
  formatter = jsonLineFormatter,
  nonBlocking = true,
  redaction = { enabled: true },
}: {
  /**
   * The console message formatter.
   * Defaults to {@link jsonLineFormatter}.
   * You can use the human-readable {@link prettyConsoleFormatter} for dev environments.
   */
  formatter?: ConsoleSinkOptions["formatter"]
  /**
   * When `true`, logs are flushed asynchronously so your hot path is never stalled.
   * You may observe a small delay in log output, but timestamps remain accurate.
   * Defaults to `true`.
   */
  nonBlocking?: boolean
  /**
   * Configures log redaction to prevent secrets from reaching your log aggregator.
   * Defaults to { enabled: true } using {@link RECOMMENDED_LOG_REDACTION}.
   * When enabled is false, redaction won't be applied and other settings will have no effect
   */
  redaction?: RedactionOptions
} = {}): LogSink {
  const sink: LogSink = getConsoleSink({
    formatter,
    nonBlocking,
  })

  if (!redaction.enabled) {
    return sink
  }

  return redactByField(sink, {
    fieldPatterns: redaction.fieldPatterns ?? RECOMMENDED_LOG_REDACTION.fieldPatterns,
    action: redaction.action ?? RECOMMENDED_LOG_REDACTION.action,
  })
}
