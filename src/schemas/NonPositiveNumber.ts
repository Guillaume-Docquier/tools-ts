import { z } from "zod"
import { branded, type Branded } from "../Brand.js"

/**
 * A number less than or equal to zero.
 */
export type NonPositiveNumber = Branded<"NonPositiveNumber", number>

/**
 * Parses a number less than or equal to zero, including zero and negative fractions.
 */
export const NonPositiveNumberSchema = z
  .number()
  .nonpositive()
  .transform(branded<NonPositiveNumber>)
