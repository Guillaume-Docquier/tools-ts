/**
 * The final log context that the {@link Logger} creates.
 * This is internal to the logger and the sinks.
 *
 * It is symmetric with {@link LogContext}, which prevents those properties from being defined.
 */
export type LoggerContext = {
  scopes: readonly string[]
  [key: string]: unknown
}
