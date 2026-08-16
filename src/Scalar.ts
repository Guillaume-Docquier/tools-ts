export const Scalar = {
  /**
   * Restricts a number to the inclusive range between min and max.
   * It will not validate that min < max.
   */
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  },
}
