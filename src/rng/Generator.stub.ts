import { TypeGuard } from "../TypeGuard.js"
import type { Generator } from "./Generator.js"

export function createGeneratorStub(value: number | (() => number)): Generator<null> {
  return {
    next: TypeGuard.isNumber(value) ? () => value : value,
    getState: () => null,
  }
}
