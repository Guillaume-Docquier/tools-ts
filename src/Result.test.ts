import { describe, it, expect } from "vitest"
import { FatalError } from "./errors/FatalError.js"
import { Result } from "./Result.js"
import { Theory } from "./Theory.js"

describe("Result", () => {
  describe("Success", () => {
    it("should return a Success with the given payload", () => {
      // Arrange
      const expectedPayload = { something: "fun!" }

      // Act
      const success = Result.Success(expectedPayload)

      // Assert
      expect(success).toStrictEqual({
        type: "Success",
        value: expectedPayload,
      })
    })
  })

  describe("isSuccess", () => {
    it("should return true given a Success and narrow the type", () => {
      // Arrange
      const expectedValue = "yay"
      const success = Result.Success(expectedValue) as Result<string, string>

      // Act
      // oxlint-disable-next-line vitest/no-conditional-in-test -- conditionals are the test
      if (Result.isSuccess(success)) {
        // This proves that we can use "value", which is only possible if the type was narrowed
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect(success.value).toStrictEqual(expectedValue)
      } else {
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect.fail("Result.isSuccess returned false, but should have returned true")
      }
    })

    it("should return false given a Failure and narrow the type", () => {
      // Arrange
      const expectedError = "boom"
      const failure = Result.Failure(expectedError) as Result<string, string>

      // Act
      // oxlint-disable-next-line vitest/no-conditional-in-test -- conditionals are the test
      if (Result.isSuccess(failure)) {
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect.fail("Result.isSuccess returned false, but should have returned true")
      } else {
        // This proves that we can use "error", which is only possible if the type was narrowed
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect(failure.error).toStrictEqual(expectedError)
      }
    })
  })

  describe("Failure", () => {
    it("should return a Failure with the given payload", () => {
      // Arrange
      const expectedPayload = { something: "broken!" }

      // Act
      const success = Result.Failure(expectedPayload)

      // Assert
      expect(success).toStrictEqual({
        type: "Failure",
        error: expectedPayload,
      })
    })
  })

  describe("isFailure", () => {
    it("should return false given a Success and narrow the type", () => {
      // Arrange
      const expectedValue = "yay"
      const success = Result.Success(expectedValue) as Result<string, string>

      // Act
      // oxlint-disable-next-line vitest/no-conditional-in-test -- conditionals are the test
      if (Result.isFailure(success)) {
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect.fail("Result.isFailure returned true, but should have returned false")
      } else {
        // This proves that we can use "value", which is only possible if the type was narrowed
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect(success.value).toStrictEqual(expectedValue)
      }
    })

    it("should return true given a Failure and narrow the type", () => {
      // Arrange
      const expectedError = "boom"
      const failure = Result.Failure(expectedError) as Result<string, string>

      // Act
      // oxlint-disable-next-line vitest/no-conditional-in-test -- conditionals are the test
      if (Result.isFailure(failure)) {
        // This proves that we can use "error", which is only possible if the type was narrowed
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect(failure.error).toStrictEqual(expectedError)
      } else {
        // oxlint-disable-next-line vitest/no-conditional-expect -- conditionals are the test
        expect.fail("Result.isFailure returned false, but should have returned true")
      }
    })
  })

  describe("tryCatch", () => {
    describe("synchronous", () => {
      it("should return a Success when the function does not throw", () => {
        // Arrange
        const expectedValue = 1
        function synchronous(): number {
          return expectedValue
        }

        // Act
        const result = Result.tryCatch(synchronous)

        // Assert
        expect(result).toStrictEqual<typeof result>(Result.Success(expectedValue))
      })

      it("should return a Failure when the function throws", () => {
        // Arrange
        const expectedError = new Error("boom")
        function synchronous(): number {
          throw expectedError
        }

        // Act
        const result = Result.tryCatch(synchronous)

        // Assert
        expect(result).toStrictEqual<typeof result>(Result.Failure(expectedError))
      })

      it("should throw when the function throws a fatal error", async () => {
        // Arrange
        const expectedError = new FatalError("boom", {})
        function synchronous(): number {
          throw expectedError
        }

        // Act & Assert
        expect(() => Result.tryCatch(synchronous)).toThrow(expectedError)
      })
    })

    describe("asynchronous", () => {
      it.each(Theory.PromiseLike)("should return a Success when the returned promise resolves", async (promiseLike) => {
        // Arrange
        function asynchronous(): PromiseLike<"value"> {
          return promiseLike
        }

        // Act
        const result = await Result.tryCatch(asynchronous)

        // Assert
        expect(result).toStrictEqual<typeof result>(Result.Success("value"))
      })

      it("should return a Failure when the returned promise rejects", async () => {
        // Arrange
        const expectedError = new Error("boom")
        async function asynchronous(): Promise<number> {
          throw expectedError
        }

        // Act
        const result = await Result.tryCatch(asynchronous)

        // Assert
        expect(result).toStrictEqual<typeof result>(Result.Failure(expectedError))
      })

      it("should throw when the returned promise rejects with a fatal error", async () => {
        // Arrange
        const expectedError = new FatalError("boom", {})
        async function asynchronous(): Promise<number> {
          throw expectedError
        }

        // Act & Assert
        await expect(async () => await Result.tryCatch(asynchronous)).rejects.toThrow(expectedError)
      })
    })

    describe("promise", () => {
      it.each(Theory.PromiseLike)("should return a Success when the promise resolves (%o)", async (promise) => {
        // Act
        const result = await Result.tryCatch(promise)

        // Assert
        expect(result).toStrictEqual<typeof result>(Result.Success("value"))
      })

      it("should return a Failure when the promise rejects", async () => {
        // Arrange
        const expectedError = new Error("boom")
        const promise = Promise.reject(expectedError)

        // Act
        const result = await Result.tryCatch(promise)

        // Assert
        expect(result).toStrictEqual<typeof result>(Result.Failure(expectedError))
      })

      it("should throw when the promise rejects with a fatal error", async () => {
        // Arrange
        const expectedError = new FatalError("boom", {})
        const promise = Promise.reject(expectedError)

        // Act & Assert
        await expect(async () => await Result.tryCatch(promise)).rejects.toThrow(expectedError)
      })
    })
  })
})
