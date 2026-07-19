/**
 * Returns the given record with omitted keys.
 *
 * @example
 * ```ts
 * const record = { a: 1, b: 2, c: 3 }
 * const omitted = omit(record, "b", "c")
 *
 * console.log(record) // { a: 1, b: 2, c: 3 }
 * console.log(omitted) // { a: 1 }
 * ```
 */
export function omit<TRecord extends Record<string, unknown>, TKey extends keyof TRecord>(
  record: Readonly<TRecord>,
  ...keys: TKey[]
): Omit<TRecord, TKey> {
  const result = { ...record }

  for (const key of keys) {
    // oxlint-disable-next-line typescript/no-dynamic-delete -- Removing caller-selected keys is the whole point
    delete result[key]
  }

  return result
}
