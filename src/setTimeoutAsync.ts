/**
 * setTimeout, but async so you can `await setTimeoutAsync(1000)`
 *
 * In node environments, you can use `setTimeout` from {@link https://nodejs.org/api/timers.html#timerspromisessettimeoutdelay-value-options node:timers/promises} but browsers don't have the equivalent
 */
export async function setTimeoutAsync(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
}
