import { describe, it, expectTypeOf } from "vitest"
import type { PartialProperties, ValueOf } from "./utility-types.js"

describe("utility-types", () => {
  describe("PartialProperties", () => {
    type ObjectWithNestedObjects = { a: number; b: { deep: { object: string } }; c: { hello: string } }

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
