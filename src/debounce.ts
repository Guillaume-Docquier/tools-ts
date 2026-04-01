/**
 * Creates a debounced function that delays invoking the callback until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 */
export function debounce<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined

  return (...args: TArgs) => {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delayMs)
  }
}
