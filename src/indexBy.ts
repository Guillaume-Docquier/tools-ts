/**
 * Indexes objects by a string-valued property.
 *
 * @example
 * ```ts
 * const users = [{ id: "alice", age: 12 }, { id: "bob", age: 34 }]
 * const usersById = indexBy("id", users)
 * // {
 * //   alice: { id: "alice", age: 12 },
 * //   bob: { id: "bob", age: 34 },
 * // }
 * ```
 */
export function indexBy<TProperty extends string, TElement extends Record<TProperty, string>>(
  property: TProperty,
  arrayOfObjects: readonly TElement[],
): Record<TElement[TProperty], TElement> {
  // oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion -- Strange TS quirk?
  const indexed = {} as Record<TElement[TProperty], TElement>
  for (const obj of arrayOfObjects) {
    indexed[obj[property]] = obj
  }

  return indexed
}
