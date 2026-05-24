import { Result } from "./Result.js"

/**
 * A finite numeric interval with an inclusive minimum and either an inclusive or exclusive maximum.
 */
export type Range<TNumericType extends NumericType> = InclusiveRange<TNumericType> | ExclusiveRange<TNumericType>

/**
 * A finite numeric interval whose maximum value is included in the range.
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
   * The function returns a Failure if the Range parameters are invalid.
   *
   * @param range The range values, excluding the discriminator added by this function.
   */
  createMaxInclusive: <TNumericType extends NumericType>(
    range: Omit<InclusiveRange<TNumericType>, "type">,
  ): Result<InclusiveRange<TNumericType>, string> => {
    const inclusiveRange: InclusiveRange<TNumericType> = {
      ...range,
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
   * The function returns a Failure if the Range parameters are invalid.
   *
   * @param range The range values, excluding the discriminator added by this function.
   */
  createMaxExclusive: <TNumericType extends NumericType>(
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
        return Range.createMaxExclusive({
          numericType: fromRange.numericType,
          min: withValues.min,
          maxExclusive: withValues.max,
          limits: fromRange.limits,
        }) as Result<TRange, string>
      case "MaxInclusive":
        return Range.createMaxInclusive({
          numericType: fromRange.numericType,
          min: withValues.min,
          maxInclusive: withValues.max,
          limits: fromRange.limits,
        }) as Result<TRange, string>
    }
  },

  /**
   * Checks whether a Range is valid. This is only useful to run on untrusted input since the Range constructors already ensures the Range is valid.
   *
   * @param range The range to validate.
   */
  validate: (range: Range<NumericType>): string | undefined => {
    const max = getMax(range)

    if (!isFiniteNumber(range.min) || !isFiniteNumber(max)) {
      return "Range bounds must be finite numbers."
    }

    if (!isValidNumberType(range.numericType, range.min) || !isValidNumberType(range.numericType, max)) {
      return `Range bounds must be ${range.numericType} values.`
    }

    if (range.type === "MaxInclusive" && range.min > range.maxInclusive) {
      return "Range minimum must be less than or equal to the inclusive maximum."
    }

    if (range.type === "MaxExclusive" && range.min >= range.maxExclusive) {
      return "Range minimum must be less than the exclusive maximum."
    }

    if (range.limits === undefined) {
      return undefined
    }

    const limitInvalidReason = Range.validate(range.limits)

    if (limitInvalidReason !== undefined) {
      return `Range limits are invalid: ${limitInvalidReason}`
    }

    if (range.numericType !== range.limits.numericType) {
      return "Range numeric type must match its limits numeric type."
    }

    if (!isContainedByLimits(range, range.limits)) {
      return "Range must be contained by its limits."
    }

    return undefined
  },

  /**
   * Checks whether a numeric value is inside the Range.
   *
   * @param range The range to test against.
   * @param value The value to test.
   */
  isWithin: (range: Range<NumericType>, value: number): boolean => {
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

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function isValidNumberType(numericType: NumericType, value: number): boolean {
  return numericType === "float" || Number.isInteger(value)
}

function isContainedByLimits(range: Range<NumericType>, limits: Range<NumericType>): boolean {
  return range.min >= limits.min && rangeUpperBoundIsWithinLimits(range, limits)
}

function rangeUpperBoundIsWithinLimits(range: Range<NumericType>, limits: Range<NumericType>): boolean {
  const rangeMax = getMax(range)
  const limitMax = getMax(limits)

  if (rangeMax < limitMax) {
    return true
  }

  if (rangeMax > limitMax) {
    return false
  }

  return range.type === "MaxExclusive" || limits.type === "MaxInclusive"
}

function getMax(range: Range<NumericType>): number {
  switch (range.type) {
    case "MaxExclusive":
      return range.maxExclusive
    case "MaxInclusive":
      return range.maxInclusive
  }
}
