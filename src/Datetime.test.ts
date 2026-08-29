import { describe, it, expect } from "vitest"
import { Datetime } from "./Datetime.js"
import { Time, UnitOfTime } from "./measurements/Time.js"

describe("Datetime", () => {
  describe("increment", () => {
    const incrementMs = 1000
    const incrementTime = Time.create(incrementMs, UnitOfTime.MILLISECONDS)

    it.each(Object.values(UnitOfTime).map((unit) => Time.convert(incrementTime, unit)))(
      "should convert the time correctly and add to the date ($unit)",
      (time) => {
        // Arrange
        const initialMs = 1234
        const date = new Date(initialMs)

        // Act
        const incremented = Datetime.increment({ date, time })

        // Assert
        expect(incremented).toStrictEqual(new Date(initialMs + incrementMs))
      },
    )
  })
})
