import { describe, expect, expectTypeOf, it } from "vitest"
import { indexBy } from "./indexBy.js"

describe("indexBy", () => {
  it("should index objects by the selected string or number property", () => {
    // Arrange
    const users = [
      { id: "alice", email: "alice@example.com", age: 30 },
      { id: "bob", email: "bob@example.com", age: 31 },
      { id: 3, email: "charlie@example.com", age: 32 },
    ]

    // Act
    const byId = indexBy("id", users)

    // Assert
    expect(byId).toStrictEqual<typeof byId>({
      alice: { id: "alice", email: "alice@example.com", age: 30 },
      bob: { id: "bob", email: "bob@example.com", age: 31 },
      3: { id: 3, email: "charlie@example.com", age: 32 },
    })
  })

  it("should narrow to the key type to string when properties are all strings", () => {
    // Arrange
    const users = [
      { id: "alice", email: "alice@example.com", age: 30 },
      { id: "bob", email: "bob@example.com", age: 31 },
    ]

    // Act
    const byId = indexBy("id", users)

    // Assert
    expectTypeOf(byId).toEqualTypeOf<Record<string, { id: string; email: string; age: number }>>()
  })

  it("should narrow to the key type to number when properties are all numbers", () => {
    // Arrange
    const users = [
      { id: 1, email: "alice@example.com", age: 30 },
      { id: 2, email: "bob@example.com", age: 31 },
    ]

    // Act
    const byId = indexBy("id", users)

    // Assert
    expectTypeOf(byId).toEqualTypeOf<Record<number, { id: number; email: string; age: number }>>()
  })

  it("should keep the last object for a duplicate key", () => {
    // Arrange
    const users = [
      { id: "alice", age: 30 },
      { id: "alice", age: 31 },
    ]

    // Act
    const byId = indexBy("id", users)

    // Assert
    expect(byId.alice).toBe(users[1])
  })

  it("should require the property to be on every element in the array", () => {
    // Arrange
    const badUsers = [{ id: "alice", age: 30 }, { age: 31 }]

    // Act
    // @ts-expect-error -- As expected, every element must have a string id and badUsers doesn't
    const byId = indexBy("id", badUsers)

    // Assert
    expect(byId).toStrictEqual({
      alice: { id: "alice", age: 30 },
      undefined: { age: 31 },
    })
  })

  it("should require the property value to be a string or number on every element in the array", () => {
    // Arrange
    const badUsers = [
      { id: "alice", age: 30 },
      { id: true, age: 31 },
    ]

    // Act
    // @ts-expect-error -- As expected, every element must have an id with a string value and badUsers doesn't
    const byId = indexBy("id", badUsers)

    // Assert
    expect(byId).toStrictEqual({
      alice: { id: "alice", age: 30 },
      true: { id: true, age: 31 },
    })
  })
})
