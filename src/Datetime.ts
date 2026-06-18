import { Time, UnitOfTime } from "./measurements/Time.js"

export const Datetime = {
  /**
   * Increments a date by x seconds
   * A unit agnostic utility would be useful here
   */
  increment: ({ date, time }: { date: Date; time: Time }): Date => {
    return new Date(date.getTime() + Time.in(time, UnitOfTime.MILLISECONDS))
  },
}
