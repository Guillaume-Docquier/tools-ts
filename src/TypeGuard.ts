import type { EnumType } from "./utility-types.js"

export const TypeGuard = {
  isFunction: (value: unknown): value is (...args: unknown[]) => unknown => typeof value === "function",
  isPromiseLike: (value: unknown): value is PromiseLike<unknown> => TypeGuard.isRecord(value) && TypeGuard.isFunction(value.then),
  isBoolean: (value: unknown): value is boolean => typeof value === "boolean",
  isString: (value: unknown): value is string => typeof value === "string",
  isNumber: (value: unknown): value is number => typeof value === "number",
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  isRecord: (value: unknown): value is Record<string | number | symbol, unknown> =>
    isObject(value) && value !== null && !TypeGuard.isArray(value),
  isEnumMember: <TEnum extends EnumType>(theEnum: TEnum, maybeEnumValue: unknown): maybeEnumValue is TEnum[keyof TEnum] =>
    Object.values(theEnum).some((enumValue) => enumValue === maybeEnumValue),
} as const

// You generally don't want to use isObject because arrays, 'objects' (records) and null are all of type "object"
// This is why this function is not exposed by the TypeGuards
function isObject(value: unknown): value is object {
  return typeof value === "object"
}
