import { Assert } from "./Assert.js"
import type { EnumType, EnumValueType } from "./utility-types.js"

/**
 * A utility that gets the key of the enum that matches the value.
 * This will throw if the key is not found.
 *
 * This is useful when the enum value itself is not very descriptive and you want to display more information.
 * This is not super efficient, as we have to iterate over all the keys of the enum (O(n)).
 *
 * @example
 * ```ts
 * const data: { value: MyEnum } = { value: MyEnum.First }
 * const enumKey = getEnumKey(MyEnum, data.value) // "First"
 * ```
 */
export function getEnumKey<TEnum extends EnumType>(theEnum: TEnum, enumValue: EnumValueType): keyof TEnum {
  const entry = Object.entries(theEnum).find(([_, value]) => value === enumValue)
  Assert.isDefined(entry, `the enum key associated with '${enumValue}'`)

  return entry[0]
}
