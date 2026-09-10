import { describe, expect, expectTypeOf, it } from "vitest"
import { branded, type Branded, type Unbranded, type UnbrandedProperties } from "./Brand.js"

type IdBase = { id: string }
type UserId = Branded<"UserId", IdBase>
type OrganizationId = Branded<"OrganizationId", IdBase>

describe("Brand", () => {
  type PositiveNumber = Branded<"PositiveNumber", number>
  type Integer = Branded<"Integer", number>
  type PositiveInteger = PositiveNumber & Integer

  describe("Branded", () => {
    it("should remain assignable to its base type while the base remains unassignable", () => {
      expectTypeOf<UserId>().toExtend<IdBase>()
      expectTypeOf<IdBase>().not.toExtend<UserId>()
    })

    it("should keep different brands with the same base type incompatible", () => {
      expectTypeOf<UserId>().not.toExtend<OrganizationId>()
      expectTypeOf<OrganizationId>().not.toExtend<UserId>()
    })

    it("should preserve single-brand primitive usage", () => {
      type StringUserId = Branded<"UserId", string>

      expectTypeOf<StringUserId>().not.toEqualTypeOf<never>()
      expectTypeOf<StringUserId>().toExtend<string>()
      expectTypeOf<string>().not.toExtend<StringUserId>()
    })

    it("should compose independently defined brands", () => {
      type NegativeNumber = Branded<"NegativeNumber", number>

      expectTypeOf<PositiveInteger>().not.toEqualTypeOf<never>()
      expectTypeOf<PositiveInteger>().toExtend<PositiveNumber>()
      expectTypeOf<PositiveInteger>().toExtend<Integer>()
      expectTypeOf<PositiveNumber>().not.toExtend<PositiveInteger>()
      expectTypeOf<Integer>().not.toExtend<PositiveInteger>()
      expectTypeOf<PositiveInteger>().not.toExtend<NegativeNumber>()
      expectTypeOf<number>().not.toExtend<PositiveInteger>()
    })
  })

  describe("branded", () => {
    it("should return the value as-is at runtime", () => {
      const rawUserId = { id: "user-1" }

      expect(branded<UserId>(rawUserId)).toBe(rawUserId)
    })

    it("should derive its parameter and return types from the brand", () => {
      expectTypeOf(branded<UserId>)
        .parameter(0)
        .toEqualTypeOf<IdBase>()
      expectTypeOf(branded<UserId>).returns.toEqualTypeOf<UserId>()
    })

    it("should derive its parameter and return types from composed brands", () => {
      expectTypeOf(branded<PositiveInteger>)
        .parameter(0)
        .toEqualTypeOf<number>()
      expectTypeOf(branded<PositiveInteger>).returns.toEqualTypeOf<PositiveInteger>()
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
      expectTypeOf({
        gameId: 1,
        amount: 1,
        playerId: "player-1",
      }).toExtend<Partial<UnbrandedProperties<ResourceUpdateModel>>>()
    })
  })
})
