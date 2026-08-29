import { afterEach, describe, expect, it, vi } from "vitest"
import { debounce } from "./debounce.js"

describe("debounce", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("should call the callback after the delay is expired", () => {
    // Arrange
    vi.useFakeTimers()
    const callback = vi.fn<(a: number, b: number, c: number) => void>()
    const delayMs = 250
    const debounced = debounce(callback, delayMs)

    // Act
    debounced(1, 2, 3)

    // Assert
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(delayMs - 1)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledExactlyOnceWith(1, 2, 3)
  })

  it("should reset the delay when the debounced function is called", () => {
    // Arrange
    vi.useFakeTimers()
    const callback = vi.fn<(a: number, b: number, c: number) => void>()
    const delayMs = 250
    const debounced = debounce(callback, delayMs)

    // Act
    debounced(1, 2, 3)
    vi.advanceTimersByTime(delayMs - 1)
    debounced(4, 5, 6)

    // Assert
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(delayMs - 1)
    expect(callback).toHaveBeenCalledExactlyOnceWith(4, 5, 6)
  })
})
