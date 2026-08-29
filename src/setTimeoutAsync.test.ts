import { afterEach, describe, expect, it, vi } from "vitest"
import { setTimeoutAsync } from "./setTimeoutAsync.js"

describe("setTimeoutAsync", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("should resolve after the timeout", async () => {
    // Arrange
    vi.useFakeTimers()
    const delayMs = 250
    const spy = vi.fn<() => void>()

    // Act
    void setTimeoutAsync(delayMs).then(spy)

    // Assert
    expect(spy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(delayMs - 1)
    expect(spy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(spy).toHaveBeenCalledOnce()
  })
})
