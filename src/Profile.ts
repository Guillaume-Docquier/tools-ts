type BasicLogger = { debug: (message: string, context?: Record<string, unknown>) => void }

/**
 * Basic utilities for profiling. Useful for quick debugging, not really production ready.
 */
export const Profile = {
  // You can't overload while defining object properties, which is why the function implementation is not inlined
  executionTime,

  /**
   * Prints the current memory usage using {@link https://nodejs.org/api/process.html#processmemoryusage process.memoryUsage()}.
   */
  memoryUsage(logger: BasicLogger = console): void {
    const memoryUsage = process.memoryUsage() // info in bytes

    logger.debug("memory usage", {
      /**
       * Resident Set Size, the total memory allocated for the whole process.
       * In Railway, this is what you pay for.
       *
       * It is basically the sum of heapTotal + external of all threads (workers).
       */
      rss: bytesToMb(memoryUsage.rss),
      /**
       * Available heap for the current thread
       */
      heapTotal: bytesToMb(memoryUsage.heapTotal),
      /**
       * Heap used for the current thread
       */
      heapUsed: bytesToMb(memoryUsage.heapUsed),
      /**
       * Memory used by C++ for the current thread, including arrayBuffers
       */
      external: bytesToMb(memoryUsage.external),
      /**
       * ArrayBuffers used for the current thread
       */
      arrayBuffers: bytesToMb(memoryUsage.arrayBuffers),
    })
  },
}

/**
 * Measures the execution time of the given synchronous action and logs it.
 * The result of the action is returned.
 */
function executionTime<T>(label: string, action: () => Promise<T>, logger?: BasicLogger): Promise<T>
/**
 * Measures the execution time of the given asynchronous action and logs it.
 * The result of the action is returned.
 */
function executionTime<T>(label: string, action: () => T, logger?: BasicLogger): T
function executionTime<T>(label: string, action: (() => Promise<T>) | (() => T), logger: BasicLogger = console): Promise<T> | T {
  const startedAt = performance.now()
  const result = action()
  if (result instanceof Promise) {
    return result.finally(() => {
      logExecutionTime(label, startedAt, logger)
    })
  }

  logExecutionTime(label, startedAt, logger)
  return result
}

function logExecutionTime(label: string, startedAt: number, logger: BasicLogger): void {
  logger.debug(label, { executionTimeMs: (performance.now() - startedAt).toFixed(2) })
}

function bytesToMb(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024).toFixed(2)} MB`
}
