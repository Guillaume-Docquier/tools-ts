declare const brand: unique symbol
declare const baseType: unique symbol

type AnyBrand = { [baseType]: unknown }
type TypeOf<TBrand extends AnyBrand> = TBrand[typeof baseType]

/**
 * Type utility to create branded types.
 *
 * @example
 * ```ts
 * type UserId = Branded<"UserId", string>
 * function getUser(userId: UserId): User {}
 *
 * const str = "a string"
 * const userId = branded<UserId>("user id")
 *
 * getUser(str) // S2345: Argument of type string is not assignable to parameter of type UserId
 * getUser(userId) // works!
 * ```
 *
 * Brands can be composed with a normal type intersection.
 *
 * ```ts
 * type PositiveNumber = Branded<"PositiveNumber", number>
 * type Integer = Branded<"Integer", number>
 * type PositiveInteger = PositiveNumber & Integer
 *
 * const positiveNumber: PositiveNumber = branded<PositiveInteger>(1)
 * const integer: Integer = branded<PositiveInteger>(1)
 * const positiveInteger: PositiveInteger  = branded<PositiveInteger>(1)
 * ```
 */
export type Branded<TBrand, TType> = TType & { readonly [brand]: (value: TBrand) => TBrand } & { [baseType]: TType }

/**
 * Brands a value.
 * This is just type gymnastics to declare intent, the value is returned as-is at runtime.
 */
export function branded<TBrand extends AnyBrand>(value: TypeOf<TBrand>): TBrand {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Branded is a compile-time marker, casting is the only way.
  return value as TBrand
}

/**
 * Removes the brand from a branded type while leaving other types unchanged.
 * Usually useful for tests when you want to accept unbranded arguments and brand them to alleviate test code.
 */
export type Unbranded<T> = T extends { [baseType]: infer Base } ? Base : T

/**
 * Removes brands from an object's property types.
 * Usually useful for tests when you want to accept unbranded arguments and brand them to alleviate test code.
 */
export type UnbrandedProperties<T> = {
  [K in keyof T]: Unbranded<T[K]>
}

/**
 * Removes brands recursively on an object.
 */
export type DeepUnbranded<T> = DeepUnbrandedValue<Unbranded<T>>

type DeepUnbrandedValue<T> = T extends Date | RegExp | ((...args: never[]) => unknown)
  ? T
  : T extends Map<infer K, infer V>
    ? Map<DeepUnbranded<K>, DeepUnbranded<V>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepUnbranded<K>, DeepUnbranded<V>>
      : T extends Set<infer V>
        ? Set<DeepUnbranded<V>>
        : T extends ReadonlySet<infer V>
          ? ReadonlySet<DeepUnbranded<V>>
          : T extends readonly unknown[]
            ? { [K in keyof T]: DeepUnbranded<T[K]> }
            : T extends object
              ? { [K in keyof T as Unbranded<K> & PropertyKey]: DeepUnbranded<T[K]> }
              : T
