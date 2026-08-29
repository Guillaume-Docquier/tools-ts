import { describe, expect, it, vi } from "vitest"
import { Time, UnitOfTime } from "./measurements/Time.js"
import { Timer } from "./Timer.js"

describe("Timer", () => {
  describe("start", () => {
    it("should capture the current performance time in milliseconds", () => {
      // Arrange
      const nowMs = 123.45
      const performanceNow = vi.spyOn(performance, "now").mockReturnValue(nowMs)

      // Act
      const startTime = Timer.start()

      // Assert
      expect(startTime).toStrictEqual<typeof startTime>(Time.create(nowMs, UnitOfTime.MILLISECONDS))
      expect(performanceNow).toHaveBeenCalledOnce()
    })
  })

  describe("since", () => {
    it("should return the elapsed time in milliseconds", () => {
      // Arrange
      const startedAt = Time.create(100, UnitOfTime.MILLISECONDS)
      const performanceNow = vi.spyOn(performance, "now").mockReturnValue(123.47)

      // Act
      const elapsed = Timer.since(startedAt)

      // Assert
      expect(elapsed).toStrictEqual<typeof elapsed>(Time.create(23.47, UnitOfTime.MILLISECONDS))
      expect(performanceNow).toHaveBeenCalledOnce()
    })

    it("should convert the start time before subtracting it", () => {
      // Arrange
      const startedAt = Time.create(0.5, UnitOfTime.SECONDS)
      const performanceNow = vi.spyOn(performance, "now").mockReturnValue(750)

      // Act
      const elapsed = Timer.since(startedAt)

      // Assert
      expect(elapsed).toStrictEqual<typeof elapsed>(Time.create(250, UnitOfTime.MILLISECONDS))
      expect(performanceNow).toHaveBeenCalledOnce()
    })
  })
})
