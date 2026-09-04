import { describe, it, expectTypeOf } from "vitest"
import type { Branded } from "./Brand.js"
import type { PartialProperties, Unbranded, UnbrandedProperties, ValueOf } from "./utility-types.js"

describe("utility-types", () => {
  describe("Unbranded", () => {
    type UserId = Branded<number, "UserId">
    type UserName = Branded<string, "UserName">

    it("should unwrap branded types and leave other types unchanged", () => {
      expectTypeOf<Unbranded<UserId>>().toEqualTypeOf<number>()
      expectTypeOf<Unbranded<UserName>>().toEqualTypeOf<string>()
      expectTypeOf<Unbranded<UserId | boolean>>().toEqualTypeOf<number | boolean>()
      expectTypeOf<Unbranded<boolean>>().toEqualTypeOf<boolean>()
    })
  })

  describe("UnbrandedProperties", () => {
    type ResourceUpdateModel = {
      readonly gameId: Branded<number, "GameId">
      playerId?: Branded<string, "PlayerId">
      enabled: boolean
    }

    it("should unwrap each property and preserve its modifiers", () => {
      expectTypeOf<UnbrandedProperties<ResourceUpdateModel>>().toEqualTypeOf<{
        readonly gameId: number
        playerId?: string
        enabled: boolean
      }>()
    })

    it("should support partially specified raw object inputs", () => {
      const input: Partial<UnbrandedProperties<ResourceUpdateModel>> = {
        gameId: 1,
        playerId: "player-1",
      }

      expectTypeOf(input).toEqualTypeOf<Partial<UnbrandedProperties<ResourceUpdateModel>>>()
    })
  })

  describe("PartialProperties", () => {
    type ObjectWithNestedObjects = { a: number; b: { deep: { object: string } }; c: { hello: string } }

    // oxlint-disable-next-line vitest/expect-expect -- this one is just a type test
    it("should make a property partial and leave the rest as is", () => {
      const data: Array<PartialProperties<ObjectWithNestedObjects, "b">> = [
        // b.deep is now optional, as expected
        { a: 1, b: {}, c: { hello: "hi" } },
        // and can still be provided
        { a: 1, b: { deep: { object: "hi" } }, c: { hello: "hi" } },
      ]

      // @ts-expect-error -- a is required, as expected
      data.push({ b: {}, c: { hello: "hi" } })

      // @ts-expect-error -- b is required, as expected
      data.push({ a: 1, c: { hello: "hi" } })

      // @ts-expect-error -- c is required, as expected
      data.push({ a: 1, b: {} })

      // @ts-expect-error -- b.deep.object is required, as expected
      data.push({ a: 1, b: { deep: {} }, c: { hello: "hi" } })
    })

    // oxlint-disable-next-line vitest/expect-expect -- this one is just a type test
    it("should make multiple properties partial and leave the rest as is", () => {
      const data: Array<PartialProperties<ObjectWithNestedObjects, "b" | "c">> = [
        // b.deep and c.hello are now optional, as expected
        { a: 1, b: {}, c: {} },
      ]

      // @ts-expect-error -- a is required, as expected
      data.push({ b: {}, c: {} })

      // @ts-expect-error -- b is required, as expected
      data.push({ a: 1, c: {} })

      // @ts-expect-error -- c is required, as expected
      data.push({ a: 1, b: {} })
    })
  })

  describe("ValueOf", () => {
    type ResponsesByStatus = {
      200: { message: string }
      400: { reason: string }
      500: { error: string }
    }

    type Responses = ValueOf<ResponsesByStatus>

    it("should create a union with the values", () => {
      expectTypeOf({ message: "200" }).toMatchTypeOf<Responses>()
      expectTypeOf({ reason: "400" }).toMatchTypeOf<Responses>()
      expectTypeOf({ error: "500" }).toMatchTypeOf<Responses>()

      expectTypeOf({ something: "not a response" }).not.toMatchTypeOf<Responses>()
    })
  })
})
