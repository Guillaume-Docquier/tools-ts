import { z } from "zod"
import { branded, type Branded } from "../Brand.js"

/**
 * A whole number, including zero and negative numbers.
 */
export type Integer = Branded<"Integer", number>

/**
 * Parses a number as an integer.
 */
export const IntegerSchema = z.int().transform(branded<Integer>)
