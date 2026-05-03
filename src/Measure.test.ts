import { afterEach, describe, expect, it, vi } from "vitest"
import { Measure } from "./Measure.js"

describe("Measure", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("executionTime", () => {
    it("should work with synchronous actions", () => {
      // Arrange
      const timeSpentMs = 23.45
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(100 + timeSpentMs)

      const label = "test synchronous action"
      const expectedResult = { ok: true }
      const logger = { info: vi.fn() }

      // Act
      const result = Measure.executionTime(label, () => expectedResult, logger)

      // Assert
      expect(result).toBe(expectedResult)
      expect(logger.info).toHaveBeenCalledExactlyOnceWith(`${label}: ${timeSpentMs}ms`)
    })

    it("should work with asynchronous actions", async () => {
      // Arrange
      const timeSpentMs = 32.78
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(100 + timeSpentMs)

      const label = "test asynchronous action"
      const expectedResult = { ok: true }
      const logger = { info: vi.fn() }

      // Act
      const result = await Measure.executionTime(label, async () => expectedResult, logger)

      // Assert
      expect(result).toBe(expectedResult)
      expect(logger.info).toHaveBeenCalledExactlyOnceWith(`${label}: ${timeSpentMs}ms`)
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

      const logger = { info: vi.fn() }

      // Act
      Measure.memoryUsage(logger)

      // Assert
      expect(logger.info).toHaveBeenCalledExactlyOnceWith("memory usage", {
        rss: "2.00 MB",
        heapTotal: "3.00 MB",
        heapUsed: "4.00 MB",
        external: "5.00 MB",
        arrayBuffers: "6.00 MB",
      })
    })
  })
})
