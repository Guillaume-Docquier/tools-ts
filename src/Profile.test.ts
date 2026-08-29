import { describe, expect, it, vi } from "vitest"
import { Profile } from "./Profile.js"

describe("Profile", () => {
  describe("executionTime", () => {
    it("should work with synchronous actions", () => {
      // Arrange
      const executionTimeMs = 23.456
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(100 + executionTimeMs)

      const label = "test synchronous action"
      const expectedResult = { ok: true }
      const logger = { debug: vi.fn<(message: string) => void>() }

      // Act
      const result = Profile.executionTime(label, () => expectedResult, logger)

      // Assert
      expect(result).toBe(expectedResult)
      expect(logger.debug).toHaveBeenCalledExactlyOnceWith(label, { executionTimeMs: "23.46" })
    })

    it("should work with asynchronous actions", async () => {
      // Arrange
      const executionTimeMs = 32.784
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(100 + executionTimeMs)

      const label = "test asynchronous action"
      const expectedResult = { ok: true }
      const logger = { debug: vi.fn<(message: string) => void>() }

      // Act
      const result = await Profile.executionTime(label, async () => expectedResult, logger)

      // Assert
      expect(result).toBe(expectedResult)
      expect(logger.debug).toHaveBeenCalledExactlyOnceWith(label, { executionTimeMs: "32.78" })
    })
  })

  describe("memoryUsage", () => {
    it("should log the memory usage", () => {
      // Arrange
      vi.spyOn(process, "memoryUsage").mockReturnValue({
        rss: 2 * 1024 * 1024,
        heapTotal: 3 * 1024 * 1024,
        heapUsed: 4 * 1024 * 1024,
        external: 5 * 1024 * 1024,
        arrayBuffers: 6 * 1024 * 1024,
      })

      const logger = { debug: vi.fn<(message: string) => void>() }

      // Act
      Profile.memoryUsage(logger)

      // Assert
      expect(logger.debug).toHaveBeenCalledExactlyOnceWith("memory usage", {
        rss: "2.00 MB",
        heapTotal: "3.00 MB",
        heapUsed: "4.00 MB",
        external: "5.00 MB",
        arrayBuffers: "6.00 MB",
      })
    })
  })
})
