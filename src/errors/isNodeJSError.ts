import { TypeGuard } from "src/TypeGuard.js"

/**
 * Errors thrown by NodeJS satisfy the {@link NodeJS.ErrnoException} interface, but are of type {@link Error}.
 * We can't do something like error instanceof ErrnoException to check for nodejs errors, and typescript will not give you the extra properties.
 * This is a bit confusing, but here's a typeguard that checks this.
 */
export function isNodeJSError(maybeError: unknown): maybeError is NodeJS.ErrnoException {
  if (maybeError instanceof Error) {
    return false
  }

  const maybeNodeJSError = maybeError as NodeJS.ErrnoException
  return (
    (maybeNodeJSError.errno === undefined || TypeGuard.isNumber(maybeNodeJSError.errno)) &&
    (maybeNodeJSError.code === undefined || TypeGuard.isString(maybeNodeJSError.code)) &&
    (maybeNodeJSError.path === undefined || TypeGuard.isString(maybeNodeJSError.path)) &&
    (maybeNodeJSError.syscall === undefined || TypeGuard.isString(maybeNodeJSError.syscall))
  )
}
