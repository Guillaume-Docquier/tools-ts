import { Rethrow } from "./errors/Rethrow.js"
import { TypeGuard } from "./TypeGuard.js"

/**
 * A Result is either a Success or a Failure.
 * You can use the Result utility functions to work nicely with Results
 */
export type Result<TValue, TError> = Success<TValue> | Failure<TError>

export interface Success<TValue> {
  type: "Success"
  value: TValue
}

export interface Failure<TError> {
  type: "Failure"
  error: TError
}

/**
 * Utility functions to work with Results.
 * @example
 * ```ts
 * const result: Result<number, string> = Result.Success(1)
 * if (Result.isSuccess(result)) {
 *   return result.value // Type safe!
 * }
 *
 * return result.error // Type safe!
 * ```
 */

export const Result = {
  /**
   * Creates a Success
   */
  Success: <TValue>(value: TValue): Success<TValue> => ({ type: "Success", value }),

  /**
   * A Success type guard
   */
  isSuccess: <TValue>(maybeSuccess: Result<TValue, unknown>): maybeSuccess is Success<TValue> => {
    return maybeSuccess.type === "Success"
  },

  /**
   * Creates a Failure
   */
  Failure: <TError>(error: TError): Failure<TError> => ({ type: "Failure", error }),

  /**
   * A Failure type guard
   */
  isFailure: <TError>(maybeFailure: Result<unknown, TError>): maybeFailure is Failure<TError> => {
    return maybeFailure.type === "Failure"
  },

  // You can't overload while defining object properties, which is why the function implementation is not inlined
  tryCatch,
}

/**
 * Creates a Result from the result of a promise.
 * If the promise resolves, you will get a {@link Result.Success}.
 * If the promise rejects, you will get a {@link Result.Failure}.
 * If the promise rejects with a fatal error, the error will be rethrown.
 *
 * @param promise The promise.
 */
function tryCatch<T>(promise: Promise<T>): Promise<Result<T, Error>>
/**
 * Creates a Result from the result of a function that returns a promise.
 * If the returned promise resolves, you will get a {@link Result.Success}.
 * If the returned promise rejects, you will get a {@link Result.Failure}.
 * If the returned promise rejects with a fatal error, the error will be rethrown.
 *
 * @param asyncFn The asynchronous callback to execute.
 */
function tryCatch<T>(asyncFn: () => Promise<T>): Promise<Result<T, Error>>
/**
 * Creates a Result from the result of a function that could throw.
 * If the function does not throw, you will get a {@link Result.Success}.
 * If the function throws, you will get a {@link Result.Failure}.
 * If the function throws a fatal error, the error will be rethrown.
 *
 * @param syncFn The synchronous callback to execute.
 */
function tryCatch<T>(syncFn: () => T): Result<T, Error>
function tryCatch<T>(op: Promise<T> | (() => T | Promise<T>)): Result<T, Error> | Promise<Result<T, Error>> {
  if (TypeGuard.isPromiseLike(op)) {
    return tryCatchPromise(op)
  }

  try {
    const result = op()

    // Async handling
    if (result instanceof Promise) {
      return tryCatchPromise(result)
    }

    // Sync handling
    return Result.Success(result)
  } catch (error) {
    Rethrow.ifFatal(error)
    return Result.Failure(error)
  }
}

function tryCatchPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  return promise.then(Result.Success).catch((error) => {
    Rethrow.ifFatal(error)
    return Result.Failure(error)
  })
}
