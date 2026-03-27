/**
 * A log context is a record of almost anything.
 * The record needs to be serializable because it could be sent over the network or written to file.
 *
 * Some properties are reserved for the logger, so you can't use them.
 */
export type LogContext = {
  /**
   * scopes is reserved for the logger.
   */
  scopes?: never
  [key: string]: unknown
}
