export const Sort = {
  /**
   * Sorts numbers by ascending values
   */
  byAscending: (a: number, b: number): number => {
    return a - b
  },

  /**
   * Sorts records by a numeric property in ascending order
   */
  byAscendingProperty:
    <TProperty extends PropertyKey>(property: TProperty) =>
    <TRecord extends Record<TProperty, number>>(a: TRecord, b: TRecord): number => {
      return Sort.byAscending(a[property], b[property])
    },

  /**
   * Sorts numbers by ascending values
   */
  byDescending: (a: number, b: number): number => {
    return b - a
  },

  /**
   * Sorts records by a numeric property in descending order
   */
  byDescendingProperty:
    <TProperty extends PropertyKey>(property: TProperty) =>
    <TRecord extends Record<TProperty, number>>(a: TRecord, b: TRecord): number => {
      return Sort.byDescending(a[property], b[property])
    },
}
