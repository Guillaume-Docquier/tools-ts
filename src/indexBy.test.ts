import { describe, expect, it } from "vitest"
import { indexBy } from "./indexBy.js"

describe("indexBy", () => {
  it("should index objects by the selected string property", () => {
    // Arrange
    const users = [
      { id: "alice", email: "alice@example.com", age: 30 },
      { id: "bob", email: "bob@example.com", age: 31 },
    ]

    // Act
    const byEmail = indexBy("email", users)

    // Assert
    expect(byEmail).toStrictEqual<typeof byEmail>({
      "alice@example.com": { id: "alice", email: "alice@example.com", age: 30 },
      "bob@example.com": { id: "bob", email: "bob@example.com", age: 31 },
    })
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

  it("should require the property value to be a string on every element in the array", () => {
    // Arrange
    const badUsers = [
      { id: "alice", age: 30 },
      { id: 1, age: 31 },
    ]

    // Act
    // @ts-expect-error -- As expected, every element must have an id with a string value and badUsers doesn't
    const byId = indexBy("id", badUsers)

    // Assert
    expect(byId).toStrictEqual({
      alice: { id: "alice", age: 30 },
      1: { id: 1, age: 31 },
    })
  })
})
