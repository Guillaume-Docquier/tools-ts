enum SortDirection {
  /**
   * From smallest to biggest.
   */
  Ascending = "Ascending",

  /**
   * From biggest to smallest.
   */
  Descending = "Descending",
}

export type Comparator<T> = (first: T, second: T) => number

export const Sort = {
  Direction: SortDirection,

  /**
   * Composes comparators.
   */
  compose: <T>(...comparators: ReadonlyArray<Comparator<T>>): Comparator<T> => {
    return (first, second) => {
      for (const comparator of comparators) {
        const comparison = comparator(first, second)
        if (comparison !== 0) {
          return comparison
        }
      }

      return 0
    }
  },

  /**
   * Compares numbers in the selected direction.
   * Defaults to Ascending.
   */
  numeric: (direction: SortDirection = SortDirection.Ascending): Comparator<number> => {
    switch (direction) {
      case SortDirection.Ascending:
        return (first, second) => first - second
      case SortDirection.Descending:
        return (first, second) => second - first
    }
  },

  /**
   * Compares records by a numeric property in the selected direction.
   * Defaults to Ascending.
   */
  byNumericProperty: <TProperty extends PropertyKey>(property: TProperty, direction: SortDirection = SortDirection.Ascending) => {
    const compare = Sort.numeric(direction)
    return <TRecord extends Record<TProperty, number>>(first: TRecord, second: TRecord): number =>
      compare(first[property], second[property])
  },
}
