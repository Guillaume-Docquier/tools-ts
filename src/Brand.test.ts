import { describe, expect, expectTypeOf, it } from "vitest"
import { branded, type Branded, type DeepUnbranded, type Unbranded, type UnbrandedProperties } from "./Brand.js"

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

  describe("DeepUnbranded", () => {
    it("should preserve nested object, array, union, and record structure when unbranding", () => {
      // Arrange
      type Id = Branded<"Id", string>
      type Input = Readonly<{
        optional?: Id | null
        tuple: readonly [Id, { id: Id }]
        byId: Readonly<Record<Id, { id: Id }>>
      }>
      type Expected = Readonly<{
        optional?: string | null
        tuple: readonly [string, { id: string }]
        byId: Readonly<Record<string, { id: string }>>
      }>

      // Act
      type DeepUnbrandedInput = DeepUnbranded<Input>

      // Assert
      expectTypeOf<DeepUnbrandedInput>().toExtend<Expected>()
      expectTypeOf<Expected>().toExtend<DeepUnbrandedInput>()
    })

    it("should distribute over a top-level union of branded, object, and null values", () => {
      // Arrange
      type Id = Branded<"Id", string>
      type Count = Branded<"Count", number>
      type Input = Id | { count: Count } | null
      type Expected = string | { count: number } | null

      // Act
      type Result = DeepUnbranded<Input>

      // Assert
      expectTypeOf<Result>().toExtend<Expected>()
      expectTypeOf<Expected>().toExtend<Result>()
    })

    it("should preserve discriminated union members nested in an object", () => {
      // Arrange
      type Id = Branded<"Id", string>
      type Input = { result: { kind: "found"; id: Id; related: ReadonlyArray<Id | null> } | { kind: "missing"; searched: Id } }
      type Expected = {
        result: { kind: "found"; id: string; related: ReadonlyArray<string | null> } | { kind: "missing"; searched: string }
      }

      // Act
      type Result = DeepUnbranded<Input>

      // Assert
      expectTypeOf<Result>().toExtend<Expected>()
      expectTypeOf<Expected>().toExtend<Result>()
    })

    it("should unbrand every member of a collection union", () => {
      // Arrange
      type Id = Branded<"Id", string>
      type Input = Map<Id, { id: Id }> | ReadonlySet<Id> | readonly [Id, { id: Id }]
      type Expected = Map<string, { id: string }> | ReadonlySet<string> | readonly [string, { id: string }]

      // Act
      type Result = DeepUnbranded<Input>

      // Assert
      expectTypeOf<Result>().toExtend<Expected>()
      expectTypeOf<Expected>().toExtend<Result>()
    })
  })
})
