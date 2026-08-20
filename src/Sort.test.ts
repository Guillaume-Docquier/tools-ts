import { describe, expect, expectTypeOf, it } from "vitest"
import { Sort } from "./Sort.js"

describe("Sort", () => {
  describe("byAscending", () => {
    it("should sort in ascending order", () => {
      // Arrange
      const unsorted = [1, 2, 1, 3, 0]

      // Act
      const sorted = unsorted.toSorted(Sort.byAscending)

      // Assert
      expect(sorted).toEqual([0, 1, 1, 2, 3])
    })
  })

  describe("byAscendingProperty", () => {
    it("should sort records by the selected numeric property in ascending order", () => {
      // Arrange
      const records = [
        { name: "two", value: 2 },
        { name: "one", value: 1 },
        { name: "three", value: 3 },
      ]

      // Act
      const result = records.toSorted(Sort.byAscendingProperty("value"))

      // Assert
      expect(result).toEqual([
        { name: "one", value: 1 },
        { name: "two", value: 2 },
        { name: "three", value: 3 },
      ])
    })

    it("should support records with non-numeric properties", () => {
      // Arrange
      type RecordWithMixedProperties = {
        id: string
        enabled: boolean
        order: number
      }
      const sorter = Sort.byAscendingProperty("order")

      // Assert
      expectTypeOf(sorter).toBeCallableWith(
        { id: "second", enabled: false, order: 2 } satisfies RecordWithMixedProperties,
        { id: "first", enabled: true, order: 1 } satisfies RecordWithMixedProperties,
      )
    })

    it("should require the selected property to be numeric", () => {
      // Arrange
      const sorter = Sort.byAscendingProperty("name")

      // Act & Assert
      // @ts-expect-error The selected property must be numeric
      sorter({ name: "second", value: 2 }, { name: "first", value: 1 })
    })
  })

  describe("byDescending", () => {
    it("should sort in descending order", () => {
      // Arrange
      const unsorted = [1, 2, 1, 3, 0]

      // Act
      const sorted = unsorted.toSorted(Sort.byDescending)

      // Assert
      expect(sorted).toEqual([3, 2, 1, 1, 0])
    })
  })

  describe("byDescendingProperty", () => {
    it("should sort records by the selected numeric property in descending order", () => {
      // Arrange
      const records = [
        { name: "two", value: 2 },
        { name: "one", value: 1 },
        { name: "three", value: 3 },
      ]

      // Act
      const result = records.toSorted(Sort.byDescendingProperty("value"))

      // Assert
      expect(result).toEqual([
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
      const sorter = Sort.byDescendingProperty("order")

      // Assert
      expectTypeOf(sorter).toBeCallableWith(
        { id: "first", enabled: true, order: 1 } satisfies RecordWithMixedProperties,
        { id: "second", enabled: false, order: 2 } satisfies RecordWithMixedProperties,
      )
    })

    it("should require the selected property to be numeric", () => {
      // Arrange
      const sorter = Sort.byDescendingProperty("name")

      // Act & Assert
      // @ts-expect-error The selected property must be numeric
      sorter({ name: "second", value: 2 }, { name: "first", value: 1 })
    })
  })
})
