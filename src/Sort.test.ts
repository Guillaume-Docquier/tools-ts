import { describe, expect, expectTypeOf, it } from "vitest"
import { type Comparator, Sort } from "./Sort.js"

describe("Sort", () => {
  describe("compose", () => {
    type Row = { group: string; rank: number; id: string }
    const rows: Row[] = [
      { group: "beta", rank: 1, id: "b" },
      { group: "alpha", rank: 2, id: "c" },
      { group: "alpha", rank: 2, id: "a" },
      { group: "alpha", rank: 1, id: "d" },
    ]

    const byGroup: Comparator<Row> = (first, second) => first.group.localeCompare(second.group)
    const byRank: Comparator<Row> = (first, second) => first.rank - second.rank
    const byId: Comparator<Row> = (first, second) => first.id.localeCompare(second.id)

    it("should apply comparators in priority order", () => {
      // Arrange
      const comparator = Sort.compose(byGroup, byRank, byId)

      // Act
      const result = rows.toSorted(comparator)

      // Assert
      expect(result.map(({ id }) => id)).toStrictEqual(["d", "a", "c", "b"])
    })

    it("should preserve each comparator's direction", () => {
      // Arrange
      const byDescendingRank = Sort.byNumericProperty("rank", Sort.Direction.Descending)
      const comparator = Sort.compose(byGroup, byDescendingRank, byId)

      // Act
      const result = rows.toSorted(comparator)

      // Assert
      expect(result.map(({ id }) => id)).toStrictEqual(["a", "c", "d", "b"])
    })

    it("should return zero when all comparators tie", () => {
      // Arrange
      const comparator = Sort.compose(byGroup, byRank)
      const first = rows[1]
      const second = rows[2]

      // Act
      const result = comparator(first, second)

      // Assert
      expect(result).toBe(0)
    })

    it("should infer the compared type from its comparators", () => {
      // Arrange
      const comparator = Sort.compose(byGroup, byRank)

      // Assert
      expectTypeOf(comparator).toEqualTypeOf<(first: Row, second: Row) => number>()
    })

    it("should return zero with no comparators", () => {
      // Arrange
      const comparator = Sort.compose()

      // Act
      const result = comparator(rows[0], rows[1])

      // Assert
      expect(result).toBe(0)
    })
  })

  describe("numeric", () => {
    it("should sort default to ascending order", () => {
      // Arrange
      const unsorted = [1, 2, 1, 3, 0]

      // Act
      const sorted = unsorted.toSorted(Sort.numeric())

      // Assert
      expect(sorted).toStrictEqual([0, 1, 1, 2, 3])
    })

    it("should sort numbers in ascending order", () => {
      // Arrange
      const unsorted = [1, 2, 1, 3, 0]

      // Act
      const sorted = unsorted.toSorted(Sort.numeric(Sort.Direction.Ascending))

      // Assert
      expect(sorted).toStrictEqual([0, 1, 1, 2, 3])
    })

    it("should sort numbers in descending order", () => {
      // Arrange
      const unsorted = [1, 2, 1, 3, 0]

      // Act
      const sorted = unsorted.toSorted(Sort.numeric(Sort.Direction.Descending))

      // Assert
      expect(sorted).toStrictEqual([3, 2, 1, 1, 0])
    })

    // oxlint-disable-next-line vitest/expect-expect -- this one is just a type test
    it("should require an enum direction", () => {
      // Act & Assert
      // @ts-expect-error Sort.numeric requires a Sort.Direction member
      Sort.numeric(1)
    })
  })

  describe("byNumericProperty", () => {
    const records = [
      { name: "two", value: 2 },
      { name: "one", value: 1 },
      { name: "three", value: 3 },
    ]

    it("should default to ascending order", () => {
      // Arrange
      const comparator = Sort.byNumericProperty("value")

      // Act
      const result = records.toSorted(comparator)

      // Assert
      expect(result).toStrictEqual([
        { name: "one", value: 1 },
        { name: "two", value: 2 },
        { name: "three", value: 3 },
      ])
    })

    it("should sort records by the selected numeric property in ascending order", () => {
      // Arrange
      const comparator = Sort.byNumericProperty("value", Sort.Direction.Ascending)

      // Act
      const result = records.toSorted(comparator)

      // Assert
      expect(result).toStrictEqual([
        { name: "one", value: 1 },
        { name: "two", value: 2 },
        { name: "three", value: 3 },
      ])
    })

    it("should sort records by the selected numeric property in descending order", () => {
      // Arrange
      const comparator = Sort.byNumericProperty("value", Sort.Direction.Descending)

      // Act
      const result = records.toSorted(comparator)

      // Assert
      expect(result).toStrictEqual([
        { name: "three", value: 3 },
        { name: "two", value: 2 },
        { name: "one", value: 1 },
      ])
    })

    it("should support records with non-numeric properties", () => {
      // Arrange
      type RecordWithMixedProperties = {
        id: string
        enabled: boolean
        order: number
      }
      const sorter = Sort.byNumericProperty("order", Sort.Direction.Descending)

      // Assert
      expectTypeOf(sorter).toBeCallableWith(
        { id: "first", enabled: true, order: 1 } satisfies RecordWithMixedProperties,
        { id: "second", enabled: false, order: 2 } satisfies RecordWithMixedProperties,
      )
    })

    // oxlint-disable-next-line vitest/expect-expect -- this one is just a type test
    it("should require the selected property to be numeric", () => {
      // Arrange
      const sorter = Sort.byNumericProperty("name", Sort.Direction.Ascending)

      // Act & Assert
      // @ts-expect-error The selected property must be numeric
      sorter({ name: "second", value: 2 }, { name: "first", value: 1 })
    })
  })
})
