import { Result } from "./Result.js"

/**
 * TODO LLM Document
 */
export type Range<TNumericType extends NumericType> = InclusiveRange<TNumericType> | ExclusiveRange<TNumericType>

/**
 * TODO LLM Document
 */
export type InclusiveRange<TNumericType extends NumericType> = {
  /**
   * TODO LLM Document
   */
  readonly type: "MaxInclusive"

  /**
   * TODO LLM Document
   */
  readonly numericType: TNumericType

  /**
   * TODO LLM Document
   */
  readonly min: number

  /**
   * TODO LLM Document
   */
  readonly maxInclusive: number

  /**
   * TODO LLM Document
   */
  readonly limits?: Range<TNumericType>
}

/**
 * TODO LLM Document
 */
export type ExclusiveRange<TNumericType extends NumericType> = {
  /**
   * TODO LLM Document
   */
  readonly type: "MaxExclusive"

  /**
   * TODO LLM Document
   */
  readonly numericType: TNumericType

  /**
   * TODO LLM Document
   */
  readonly min: number

  /**
   * TODO LLM Document
   */
  readonly maxExclusive: number

  /**
   * TODO LLM Document
   */
  readonly limits?: Range<TNumericType>
}

type NumericType = "float" | "integer"

/**
 * TODO LLM Document
 */
export const Range = {
  /**
   * // TODO LLM Document
   * @param range
   */
  createMaxInclusive: <TNumericType extends NumericType>(
    range: Omit<InclusiveRange<TNumericType>, "type">,
  ): Result<InclusiveRange<TNumericType>, string> => {
    const inclusiveRange: InclusiveRange<TNumericType> = {
      ...range,
      type: "MaxInclusive",
    }

    const invalidReason = validateRange(inclusiveRange)
    if (invalidReason !== undefined) {
      return Result.Failure(invalidReason)
    }

    return Result.Success(inclusiveRange)
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  createMaxExclusive: <TNumericType extends NumericType>(
    range: Omit<ExclusiveRange<TNumericType>, "type">,
  ): Result<ExclusiveRange<TNumericType>, string> => {
    const exclusiveRange: ExclusiveRange<TNumericType> = {
      ...range,
      type: "MaxExclusive",
    }

    const invalidReason = validateRange(exclusiveRange)
    if (invalidReason !== undefined) {
      return Result.Failure(invalidReason)
    }

    return Result.Success(exclusiveRange)
  },

  /**
   * // TODO LLM Document
   * @param fromRange
   * @param withValues
   */
  from: <TRange extends Range<TNumericType>, TNumericType extends NumericType>(
    fromRange: TRange,
    withValues: { min: number; max: number },
  ): Result<TRange, string> => {
    if (Range.isInclusive(fromRange)) {
      return Range.createMaxInclusive({
        numericType: fromRange.numericType,
        min: withValues.min,
        maxInclusive: withValues.max,
        limits: fromRange.limits,
      }) as Result<TRange, string>
    }

    return Range.createMaxExclusive({
      numericType: fromRange.numericType,
      min: withValues.min,
      maxExclusive: withValues.max,
      limits: fromRange.limits,
    }) as Result<TRange, string>
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  isValid: (range: Range<NumericType>): boolean => {
    return validateRange(range) === undefined
  },

  /**
   * // TODO LLM Document
   * @param range
   * @param value
   */
  isWithin: (range: Range<NumericType>, value: number): boolean => {
    if (!Range.isValid(range) || !isFiniteNumber(value) || !isValidNumberType(range.numericType, value)) {
      return false
    }

    return isWithinBounds(range, value)
  },

  /**
   * // TODO LLM Document
   * @param a
   * @param b
   */
  overlaps: (a: Range<NumericType>, b: Range<NumericType>): boolean => {
    if (!Range.isValid(a) || !Range.isValid(b) || a.numericType !== b.numericType) {
      return false
    }

    return upperBoundIntersectsMin(a, b.min) && upperBoundIntersectsMin(b, a.min)
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  isInclusive: <TNumericType extends NumericType>(range: Range<TNumericType>): range is InclusiveRange<TNumericType> => {
    return range.type === "MaxInclusive"
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  isExclusive: <TNumericType extends NumericType>(range: Range<TNumericType>): range is ExclusiveRange<TNumericType> => {
    return range.type === "MaxExclusive"
  },
}

function validateRange(range: Range<NumericType>): string | undefined {
  const max = getMax(range)

  if (!isFiniteNumber(range.min) || !isFiniteNumber(max)) {
    return "Range bounds must be finite numbers."
  }

  if (!isValidNumberType(range.numericType, range.min) || !isValidNumberType(range.numericType, max)) {
    return `Range bounds must be ${range.numericType} values.`
  }

  if (Range.isInclusive(range) && range.min > range.maxInclusive) {
    return "Range minimum must be less than or equal to the inclusive maximum."
  }

  if (Range.isExclusive(range) && range.min >= range.maxExclusive) {
    return "Range minimum must be less than the exclusive maximum."
  }

  if (range.limits === undefined) {
    return undefined
  }

  const limitInvalidReason = validateRange(range.limits)

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
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function isValidNumberType(numericType: NumericType, value: number): boolean {
  return numericType === "float" || Number.isInteger(value)
}

function isWithinBounds(range: Range<NumericType>, value: number): boolean {
  if (value < range.min) {
    return false
  }

  if (Range.isInclusive(range)) {
    return value <= range.maxInclusive
  }

  return value < range.maxExclusive
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

  return Range.isExclusive(range) || Range.isInclusive(limits)
}

function getMax(range: Range<NumericType>): number {
  if (Range.isInclusive(range)) {
    return range.maxInclusive
  }

  return range.maxExclusive
}

function upperBoundIntersectsMin(range: Range<NumericType>, min: number): boolean {
  const max = getMax(range)

  if (max > min) {
    return true
  }

  return max === min && Range.isInclusive(range)
}
