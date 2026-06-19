import { describe, expect, expectTypeOf, it } from "vitest"
import { Sort } from "./Sort.js"

describe("Sort", () => {
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
})
