import { z } from "zod"
import { branded, type Branded } from "../Brand.js"

/**
 * A number greater than zero; zero is neither positive nor negative.
 */
export type PositiveNumber = Branded<"PositiveNumber", number>

/**
 * Parses a number greater than zero, including positive fractions.
 */
export const PositiveNumberSchema = z
  .number()
  .positive()
  .transform(branded<PositiveNumber>)
