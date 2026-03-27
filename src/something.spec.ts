import { describe, expect, it } from "vitest"
import { something } from "./something"

describe("something", () => {
  it("should be a string", () => {
    expect(typeof something).toEqual("string")
  })
})
