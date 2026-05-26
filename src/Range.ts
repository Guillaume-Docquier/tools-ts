import { Result } from "./Result.js"
import { Assert } from "./Assert.js"

/**
 * A finite numeric interval with an inclusive minimum and either an inclusive or exclusive maximum.
 * Use the Range factory methods to create valid ranges.
 */
export type Range<TNumericType extends NumericType = NumericType> = InclusiveRange<TNumericType> | ExclusiveRange<TNumericType>

/**
 * A finite numeric interval whose maximum value is included in the range.
 * Use the {@link Range.safeCreateMaxInclusive} or {@link Range.createMaxInclusive} factory methods to create valid InclusiveRanges.
 */
export type InclusiveRange<TNumericType extends NumericType> = {
  /**
   * Discriminator for ranges where the maximum value is included.
   */
  readonly type: "MaxInclusive"

  /**
   * The kind of numeric values accepted by the range.
   */
  readonly numericType: TNumericType

  /**
   * The inclusive lower bound.
   */
  readonly min: number

  /**
   * The inclusive upper bound.
   */
  readonly maxInclusive: number

  /**
   * Optional outer range that this range must stay within.
   */
  readonly limits?: Range<TNumericType>
}

/**
 * A finite numeric interval whose maximum value is excluded from the range.
 * Use the {@link Range.safeCreateMaxExclusive} or {@link Range.createMaxExclusive} factory methods to create valid ExclusiveRanges.
 */
export type ExclusiveRange<TNumericType extends NumericType> = {
  /**
   * Discriminator for ranges where the maximum value is excluded.
   */
  readonly type: "MaxExclusive"

  /**
   * The kind of numeric values accepted by the range.
   */
  readonly numericType: TNumericType

  /**
   * The inclusive lower bound.
   */
  readonly min: number

  /**
   * The exclusive upper bound.
   */
  readonly maxExclusive: number

  /**
   * Optional outer range that this range must stay within.
   */
  readonly limits?: Range<TNumericType>
}

type NumericType = "float" | "integer"

/**
 * Helpers for creating, validating, comparing, and narrowing numeric ranges.
 */
export const Range = {
  /**
   * Creates a range that includes its maximum value.
   * The function throws if the Range parameters are invalid. You should use this for trusted code only.
   *
   * @param data The range values, excluding the discriminator added by this function.
   */
  createMaxInclusive: <TNumericType extends NumericType>(
    data: Omit<InclusiveRange<TNumericType>, "type">,
  ): InclusiveRange<TNumericType> => {
    const rangeResult = Range.safeCreateMaxInclusive(data)
    Assert.isSuccess(rangeResult)

    return rangeResult.value
  },

  /**
   * Creates a range that includes its maximum value.
   * The function returns a Failure if the Range parameters are invalid.
   *
   * @param data The range values, excluding the discriminator added by this function.
   */
  safeCreateMaxInclusive: <TNumericType extends NumericType>(
    data: Omit<InclusiveRange<TNumericType>, "type">,
  ): Result<InclusiveRange<TNumericType>, string> => {
    const inclusiveRange: InclusiveRange<TNumericType> = {
      ...data,
      type: "MaxInclusive",
    }

    const invalidReason = Range.validate(inclusiveRange)
    if (invalidReason !== undefined) {
      return Result.Failure(invalidReason)
    }

    return Result.Success(inclusiveRange)
  },

  /**
   * Creates a range that excludes its maximum value.
   * The function throws if the Range parameters are invalid. You should use this for trusted code only.
   *
   * @param data The range values, excluding the discriminator added by this function.
   */
  createMaxExclusive: <TNumericType extends NumericType>(
    data: Omit<ExclusiveRange<TNumericType>, "type">,
  ): ExclusiveRange<TNumericType> => {
    const rangeResult = Range.safeCreateMaxExclusive(data)
    Assert.isSuccess(rangeResult)

    return rangeResult.value
  },

  /**
   * Creates a range that excludes its maximum value.
   * The function returns a Failure if the Range parameters are invalid.
   *
   * @param range The range values, excluding the discriminator added by this function.
   */
  safeCreateMaxExclusive: <TNumericType extends NumericType>(
    range: Omit<ExclusiveRange<TNumericType>, "type">,
  ): Result<ExclusiveRange<TNumericType>, string> => {
    const exclusiveRange: ExclusiveRange<TNumericType> = {
      ...range,
      type: "MaxExclusive",
    }

    const invalidReason = Range.validate(exclusiveRange)
    if (invalidReason !== undefined) {
      return Result.Failure(invalidReason)
    }

    return Result.Success(exclusiveRange)
  },

  /**
   * Creates a new range with the same discriminator, numeric type, and limits as another range.
   *
   * @param fromRange The range to copy the shape from.
   * @param withValues The replacement minimum and maximum values.
   */
  from: <TRange extends Range<TNumericType>, TNumericType extends NumericType>(
    fromRange: TRange,
    withValues: { min: number; max: number },
  ): Result<TRange, string> => {
    switch (fromRange.type) {
      case "MaxExclusive":
        return Range.safeCreateMaxExclusive({
          numericType: fromRange.numericType,
          min: withValues.min,
          maxExclusive: withValues.max,
          limits: fromRange.limits,
        }) as Result<TRange, string>
      case "MaxInclusive":
        return Range.safeCreateMaxInclusive({
          numericType: fromRange.numericType,
          min: withValues.min,
          maxInclusive: withValues.max,
          limits: fromRange.limits,
        }) as Result<TRange, string>
    }
  },

  /**
   * Checks whether a Range is valid.
   * This is only useful to run on untrusted input since the Range constructors already ensures the Range is valid.
   *
   * @param range The range to validate.
   */
  validate: (range: Range): string | undefined => {
    for (const rule of RANGE_VALIDATION_RULES) {
      const reason = rule(range)
      if (reason !== undefined) {
        return reason
      }
    }

    return undefined
  },

  /**
   * Checks whether a numeric value is inside the Range.
   *
   * @param range The range to test against.
   * @param value The value to test.
   */
  isWithin: (range: Range, value: number): boolean => {
    if (value < range.min) {
      return false
    }

    switch (range.type) {
      case "MaxExclusive":
        return value < range.maxExclusive
      case "MaxInclusive":
        return value <= range.maxInclusive
    }
  },

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

type RangeValidationRule = typeof Range.validate
const RANGE_VALIDATION_RULES: RangeValidationRule[] = [
  minIsFinite,
  maxIsFinite,
  minIsValidNumberType,
  maxIsValidNumberType,
  minIsSmallerThanMax,
  limitsAreValid,
  minIsWithinLimits,
  maxIsWithinLimits,
]

function minIsFinite(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return Number.isFinite(range.min) ? undefined : "Min must be a finite number"
}
function maxIsFinite(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return Number.isFinite(getMax(range)) ? undefined : "Min must be a finite number"
}

function minIsValidNumberType(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.numericType === "float" || Number.isInteger(range.min) ? undefined : `Min must be a ${range.numericType} number`
}
function maxIsValidNumberType(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.numericType === "float" || Number.isInteger(getMax(range)) ? undefined : `Max must be a ${range.numericType} number`
}

function minIsSmallerThanMax(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  switch (range.type) {
    case "MaxExclusive":
      return range.min < range.maxExclusive ? undefined : "Min must be smaller than the exclusive max"
    case "MaxInclusive":
      return range.min <= range.maxInclusive ? undefined : "Min must be smaller or equal to the inclusive max"
  }
}

function limitsAreValid(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.limits === undefined ? undefined : Range.validate(range.limits)
}

function minIsWithinLimits(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.limits === undefined || Range.isWithin(range.limits, range.min) ? undefined : "Min must be within limits"
}
function maxIsWithinLimits(range: Parameters<RangeValidationRule>[0]): ReturnType<RangeValidationRule> {
  return range.limits === undefined || Range.isWithin(range.limits, getMax(range)) ? undefined : "Max must be within limits"
}

function getMax(range: Range): number {
  switch (range.type) {
    case "MaxExclusive":
      return range.maxExclusive
    case "MaxInclusive":
      return range.maxInclusive
  }
}
