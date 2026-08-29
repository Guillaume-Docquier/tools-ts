import { describe, expect, expectTypeOf, it } from "vitest"
import { branded, type Branded } from "./Brand.js"

type IdBase = { id: string }
type UserId = Branded<IdBase, "UserId">
type OrganizationId = Branded<IdBase, "OrganizationId">

describe("Brand", () => {
  describe("branded", () => {
    it("should return the value as-is at runtime", () => {
      // Arrange
      const rawUserId = { id: "user-1" }

      // Act
      const userId = branded<UserId>(rawUserId)

      // Assert
      expect(userId).toBe(rawUserId)
    })

    it("should keep the branded value assignable to its base type", () => {
      // Arrange
      const rawUserId = { id: "user-1" }

      // Act
      const userId = branded<UserId>(rawUserId)

      // Assert
      expectTypeOf(userId).toEqualTypeOf<UserId>()
      expectTypeOf(userId).toExtend<IdBase>()
    })

    // oxlint-disable-next-line vitest/expect-expect -- this is a type test
    it("should require a value matching the brand base type", () => {
      // Act & Assert
      // @ts-expect-error UserId is a branded object with string property, not a number
      branded<UserId>({ id: 123 })
    })

    it("should keep different brands with the same base type incompatible", () => {
      // Arrange
      const id = { id: "user-1" }

      // Act
      const userId = branded<UserId>(id)
      const orgId = branded<OrganizationId>(id)

      // Assert
      expectTypeOf(userId).not.toEqualTypeOf(orgId)
    })
  })
})
