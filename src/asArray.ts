import { TypeGuard } from "./TypeGuard.js"

/**
 * A simple utility to be able to accept single values or arrays and treat them as arrays.
 *
 * @example
 * ```ts
 * function doThings(thingsToDo: Something | Something[]): void {
 *   for (const thingToDo of asArray(thingsToDo)) {
 *     // Do the things
 *   }
 * }
 * ```
 */
export function asArray<TValue>(values: TValue | TValue[]): TValue[] {
  return TypeGuard.isArray(values) ? values : [values]
}
