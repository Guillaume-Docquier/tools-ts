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
    range: Exclude<InclusiveRange<TNumericType>, "type">,
  ): Result<InclusiveRange<TNumericType>, string> => {
    // TODO LLM Implement
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  createMaxExclusive: <TNumericType extends NumericType>(
    range: Exclude<ExclusiveRange<TNumericType>, "type">,
  ): Result<ExclusiveRange<TNumericType>, string> => {
    // TODO LLM Implement
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
    // TODO LLM Implement
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  isValid: (range: Range<NumericType>): boolean => {
    // TODO LLM Implement
  },

  /**
   * // TODO LLM Document
   * @param range
   * @param value
   */
  isWithin: (range: Range<NumericType>, value: number): boolean => {
    // TODO LLM Implement
  },

  /**
   * // TODO LLM Document
   * @param a
   * @param b
   */
  overlaps: (a: Range<NumericType>, b: Range<NumericType>): boolean => {
    // TODO LLM Implement
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  isInclusive: <TNumericType extends NumericType>(range: Range<TNumericType>): range is InclusiveRange<TNumericType> => {
    // TODO LLM Implement
  },

  /**
   * // TODO LLM Document
   * @param range
   */
  isExclusive: <TNumericType extends NumericType>(range: Range<TNumericType>): range is ExclusiveRange<TNumericType> => {
    // TODO LLM Implement
  },
}
