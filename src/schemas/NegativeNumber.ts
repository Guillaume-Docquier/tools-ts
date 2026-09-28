import { z } from "zod"
import { branded, type Branded } from "../Brand.js"

/**
 * A number less than zero.
 */
export type NegativeNumber = Branded<"NegativeNumber", number>

/**
 * Parses a number less than zero, including negative fractions.
 */
export const NegativeNumberSchema = z
  .number()
  .negative()
  .transform(branded<NegativeNumber>)
