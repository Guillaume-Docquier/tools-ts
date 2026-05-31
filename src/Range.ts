import { Result } from "./Result.js"
import { Assert } from "./Assert.js"
import { TypeGuard } from "./TypeGuard.js"

type NumericType = "float" | "integer"
type BoundType = "inclusive" | "exclusive"

/**
 * A finite numeric interval with an inclusive minimum and either an inclusive or exclusive maximum.
 * Use the Range factory methods to create valid ranges.
 */
export type Range<TNumericType extends NumericType = NumericType, TBoundType extends BoundType = BoundType> = {
  /**
   * The kind of numeric values accepted by the range.
   */
  readonly numericType: TNumericType

  /**
   * Whether the max bound should be inclusive or exclusive.
   */
  readonly maxBoundType: TBoundType

  /**
   * The inclusive lower bound.
   */
  readonly min: number

  /**
   * The inclusive upper bound.
   */
  readonly max: number
}

/**
 * Helpers for creating, validating, comparing, and narrowing numeric ranges.
 */
export const Range = {
  /**
   * Creates a range.
   * The function throws if the Range parameters are invalid. You should use this for trusted code only.
   *
   * @param data The range values.
   */
  create: <TNumericType extends NumericType, TBoundType extends BoundType>(
    data: Range<TNumericType, TBoundType>,
  ): Range<TNumericType, TBoundType> => {
    const rangeResult = Range.safeCreate(data)
    Assert.isSuccess(rangeResult)

    return rangeResult.value
  },

  /**
   * Creates a range.
   * The function returns a Failure if the Range parameters are invalid.
   *
   * @param data The range values.
   */
  safeCreate: <TNumericType extends NumericType, TBoundType extends BoundType>(
    data: Range<TNumericType, TBoundType>,
  ): Result<Range<TNumericType, TBoundType>, string> => {
    const invalidReason = validate(data)
    if (invalidReason !== undefined) {
      return Result.Failure(invalidReason)
    }

    return Result.Success(data)
  },

  /**
   * Creates a new range from another one.
   * When passing withValues, the min and max will replace that of the base range.
   * When withValues is omitted, this returns a clone.
   *
   * @param fromRange The range to copy the shape from.
   * @param withValues The replacement minimum or maximum values.
   */
  from: <TNumericType extends NumericType, TBoundType extends BoundType>(
    fromRange: Range<TNumericType, TBoundType>,
    withValues: { min?: number; max?: number } = {},
  ): Result<Range<TNumericType, TBoundType>, string> => {
    return Range.safeCreate({
      ...fromRange,
      ...withValues,
    })
  },

  isWithin,

  /**
   * Checks whether two Ranges share at least one value.
   *
   * @param a The first range.
   * @param b The second range.
   */
  overlaps: <TNumericType extends NumericType>(a: Range<TNumericType>, b: Range<TNumericType>): boolean => {
    return Range.isWithin(a, b.min) || Range.isWithin(b, a.min)
  },
}

/**
 * Checks whether a Range is inside another Range.
 *
 * @param bounds The largest range.
 * @param value The range to check.
 */
function isWithin(bounds: Range, value: Range): boolean
/**
 * Checks whether a numeric value is inside the Range.
 *
 * @param bounds The range to test against.
 * @param value The value to test.
 */
function isWithin(bounds: Range, value: number): boolean
/**
 * Checks whether a numeric value or Range is inside another Range.
 *
 * @param bounds The range to test against.
 * @param value The value to test.
 */
function isWithin(bounds: Range, value: number | Range): boolean {
  if (TypeGuard.isNumber(value)) {
    if (value < bounds.min) {
      return false
    }

    if (value < bounds.max) {
      return true
    }

    if (value === bounds.max) {
      return bounds.maxBoundType === "inclusive"
    }

    return false
  }

  const normalizedBounds = normalizeUpperBound(bounds)
  const normalizedValue = normalizeUpperBound(value)

  if (value.min < bounds.min) {
    return false
  }

  if (normalizedValue.max < normalizedBounds.max) {
    return true
  }

  if (normalizedValue.max > normalizedBounds.max) {
    return false
  }

  return !(normalizedValue.boundType === "inclusive" && normalizedBounds.boundType === "exclusive")
}

function normalizeUpperBound(range: Range): { max: number; boundType: BoundType } {
  if (range.numericType === "integer" && range.maxBoundType === "exclusive") {
    return {
      max: range.max - 1,
      boundType: "inclusive",
    }
  }

  return {
    max: range.max,
    boundType: range.maxBoundType,
  }
}

/**
 * Checks whether a Range is valid.
 * This is only useful to run on untrusted input since the Range constructors already ensures the Range is valid.
 *
 * @param range The range to validate.
 */
function validate(range: Range): string | undefined {
  for (const rule of RANGE_VALIDATION_RULES) {
    const reason = rule(range)
    if (reason !== undefined) {
      return reason
    }
  }

  return undefined
}

type RangeValidationRule = typeof validate
const RANGE_VALIDATION_RULES: RangeValidationRule[] = [
  minIsFinite,
  maxIsFinite,
  minIsValidNumericType,
  maxIsValidNumericType,
  minIsSmallerThanMax,
]

function minIsFinite(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return Number.isFinite(range.min) ? undefined : "Min must be a finite number"
}
function maxIsFinite(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return Number.isFinite(range.max) ? undefined : "Min must be a finite number"
}

function minIsValidNumericType(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.numericType === "float" || Number.isInteger(range.min) ? undefined : `Min must be a ${range.numericType} number`
}
function maxIsValidNumericType(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.numericType === "float" || Number.isInteger(range.max) ? undefined : `Max must be a ${range.numericType} number`
}

function minIsSmallerThanMax(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  switch (range.maxBoundType) {
    case "exclusive":
      return range.min < range.max ? undefined : "Min must be smaller than the exclusive max"
    case "inclusive":
      return range.min <= range.max ? undefined : "Min must be smaller or equal to the inclusive max"
  }
}
