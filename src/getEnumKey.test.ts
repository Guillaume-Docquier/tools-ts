import { describe, expect, expectTypeOf, it } from "vitest"
import { getEnumKey } from "./getEnumKey.js"

export enum StringEnum {
  String1 = "1",
  String2 = "2",
}

export enum NumberEnum {
  Number1 = 1,
  Number2 = 2,
}

describe("getEnumKey", () => {
  it.each([StringEnum, NumberEnum])("should throw when the key is not found", (theEnum) => {
    expect(() => {
      getEnumKey(theEnum, "not an enum value")
    }).toThrow()
  })

  it("should should return the key when the value matches in a string enum", () => {
    expect.soft(getEnumKey(StringEnum, StringEnum.String1)).toEqual("String1")
    expect.soft(getEnumKey(StringEnum, "2")).toEqual("String2")
  })

  it("should should return the key when the value matches in a number enum", () => {
    expect.soft(getEnumKey(NumberEnum, NumberEnum.Number1)).toEqual("Number1")
    expect.soft(getEnumKey(NumberEnum, 2)).toEqual("Number2")
  })

  it("should be type safe on the return type", () => {
    expectTypeOf(getEnumKey(NumberEnum, NumberEnum.Number1)).toEqualTypeOf<"Number1" | "Number2">()
  })
})
