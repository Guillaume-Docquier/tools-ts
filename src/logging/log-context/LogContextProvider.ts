import type { LogContext } from "./LogContext.js"

/**
 * A context provider allow consumers to control and mutate the context that will be attached to logs.
 * Useful if you must create a logger before you have all the data you'd like to attach.
 */
export interface LogContextProvider {
  /**
   * Gets the context.
   * This will be called on each log call. Make sure this operation is not expensive, or you'll tank the logging performance.
   */
  getContext: () => LogContext
}
