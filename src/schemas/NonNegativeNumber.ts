import { z } from "zod"
import { branded, type Branded } from "../Brand.js"

/**
 * A number greater than or equal to zero.
 */
export type NonNegativeNumber = Branded<"NonNegativeNumber", number>

/**
 * Parses a number greater than or equal to zero, including zero and positive fractions.
 */
export const NonNegativeNumberSchema = z
  .number()
  .nonnegative()
  .transform(branded<NonNegativeNumber>)
