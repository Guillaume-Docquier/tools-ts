import { describe, expect, expectTypeOf, it } from "vitest"
import { branded, type Branded, type Unbranded, type UnbrandedProperties } from "./Brand.js"

type IdBase = { id: string }
type UserId = Branded<"UserId", IdBase>
type OrganizationId = Branded<"OrganizationId", IdBase>

describe("Brand", () => {
  type PositiveNumber = Branded<"PositiveNumber", number>
  type Integer = Branded<"Integer", number>
  type PositiveInteger = PositiveNumber & Integer

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

    it("should preserve single-brand string usage", () => {
      // Arrange
      type UserId = Branded<"UserId", string>

      // Act
      const userId = branded<UserId>("id")

      // Assert
      expectTypeOf(userId).toEqualTypeOf<UserId>()
    })

    it("should compose independently defined brands", () => {
      // Arrange
      type NegativeNumber = Branded<"NegativeNumber", number>

      // Act
      const positiveNumber = branded<PositiveNumber>(1)
      const integer = branded<Integer>(1)
      const positiveInteger = branded<PositiveInteger>(1)

      // Assert
      expectTypeOf<PositiveInteger>().not.toEqualTypeOf<never>()
      expectTypeOf(positiveInteger).toEqualTypeOf<PositiveInteger>()
      expectTypeOf(positiveInteger).toExtend<PositiveNumber>()
      expectTypeOf(positiveInteger).toExtend<Integer>()

      // @ts-expect-error PositiveNumber is not necessarily an Integer
      const notPositiveIntegerFromPositiveNumber: PositiveInteger = positiveNumber
      void notPositiveIntegerFromPositiveNumber

      // @ts-expect-error Integer is not necessarily positive
      const notPositiveIntegerFromInteger: PositiveInteger = integer
      void notPositiveIntegerFromInteger

      // @ts-expect-error PositiveInteger is not a NegativeNumber
      const negativeNumber: NegativeNumber = positiveInteger
      void negativeNumber

      // @ts-expect-error An unbranded number cannot be used as a PositiveNumber
      const unbrandedPositiveNumber: PositiveNumber = 1
      void unbrandedPositiveNumber

      // @ts-expect-error An unbranded number cannot be used as an Integer
      const unbrandedInteger: Integer = 1
      void unbrandedInteger

      // @ts-expect-error An unbranded number cannot be used as a PositiveInteger
      const unbrandedPositiveInteger: PositiveInteger = 1
      void unbrandedPositiveInteger

      // @ts-expect-error PositiveInteger has a number base type
      branded<PositiveInteger>("1")
    })

    // oxlint-disable-next-line vitest/expect-expect -- this is a type test
    it("should keep brands with incompatible base primitives incompatible", () => {
      // Arrange
      type StringBrand = Branded<"StringBrand", string>
      type NumberBrand = Branded<"NumberBrand", number>

      // Act
      const stringBrand = branded<StringBrand>("value")

      // Assert
      // @ts-expect-error A branded string is not a branded number
      const numberBrand: NumberBrand = stringBrand
      void numberBrand
    })
  })

  describe("Unbranded", () => {
    type UserId = Branded<"UserId", number>
    type UserName = Branded<"UserName", string>

    it("should unwrap branded types and leave other types unchanged", () => {
      expectTypeOf<Unbranded<UserId>>().toEqualTypeOf<number>()
      expectTypeOf<Unbranded<UserName>>().toEqualTypeOf<string>()
      expectTypeOf<Unbranded<PositiveInteger>>().toEqualTypeOf<number>()
      expectTypeOf<Unbranded<UserId | boolean>>().toEqualTypeOf<number | boolean>()
      expectTypeOf<Unbranded<boolean>>().toEqualTypeOf<boolean>()
    })
  })

  describe("UnbrandedProperties", () => {
    type ResourceUpdateModel = {
      readonly gameId: Branded<"GameId", number>
      readonly amount: PositiveInteger
      playerId?: Branded<"PlayerId", string>
      enabled: boolean
    }

    it("should unwrap each property and preserve its modifiers", () => {
      expectTypeOf<UnbrandedProperties<ResourceUpdateModel>>().toEqualTypeOf<{
        readonly gameId: number
        readonly amount: number
        playerId?: string
        enabled: boolean
      }>()
    })

    it("should support partially specified raw object inputs", () => {
      const input: Partial<UnbrandedProperties<ResourceUpdateModel>> = {
        gameId: 1,
        amount: 1,
        playerId: "player-1",
      }

      expectTypeOf(input).toEqualTypeOf<Partial<UnbrandedProperties<ResourceUpdateModel>>>()
    })
  })
})
