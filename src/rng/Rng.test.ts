import { describe, expect, it } from "vitest"
import { Range } from "../Range.js"
import { Sort } from "../Sort.js"
import { type Generator } from "./Generator.js"
import { createGeneratorStub } from "./Generator.stub.js"
import { mulberry32Prng } from "./mulberry32prng.js"
import { Rng, type RngState } from "./Rng.js"

describe("Rng", () => {
  describe("state", () => {
    it("should resume from JSON-serializable state when no normal value is cached", () => {
      // Arrange
      const rng = Rng.create(mulberry32Prng(1234))
      rng.float()

      // Act
      const serializedState = JSON.stringify(rng.getState())
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The JSON comes from Rng.getState in this test.
      const state = JSON.parse(serializedState) as RngState<number>
      const restoredRng = Rng.fromState(state, mulberry32Prng)
      const expectedValues = [rng.float(), rng.float(), rng.float()]
      const restoredValues = [restoredRng.float(), restoredRng.float(), restoredRng.float()]

      // Assert
      expect(restoredValues).toEqual(expectedValues)
    })

    it("should resume the generator and cached normal value from state", () => {
      // Arrange
      const rng = Rng.create(mulberry32Prng(1234))
      rng.normal()
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The JSON comes from Rng.getState in this test.
      const state = JSON.parse(JSON.stringify(rng.getState())) as RngState<number>
      const restoredRng = Rng.fromState(state, mulberry32Prng)

      // Act
      const expectedValues = [rng.normal(100, 3), rng.float(), rng.normal()]
      const restoredValues = [restoredRng.normal(100, 3), restoredRng.float(), restoredRng.normal()]

      // Assert
      expect(restoredValues).toEqual(expectedValues)
    })
  })

  describe("random", () => {
    it("should return a float when given a float range", () => {
      // Arrange
      const range = Range.create({ numericType: "float", maxBoundType: "inclusive", min: 10, max: 20 })
      const rng = Rng.create(createGeneratorStub(0.5))

      // Act
      const random = rng.random(range)

      // Assert
      expect(random).toEqual(15)
    })

    it("should return an int when given an inclusive integer range", () => {
      // Arrange
      const range = Range.create({ numericType: "integer", maxBoundType: "inclusive", min: 10, max: 20 })
      const rng = Rng.create(createGeneratorStub(0.65))

      // Act
      const random = rng.random(range)

      // Assert
      expect(random).toEqual(17)
    })

    it("should return an int when given an exclusive integer range", () => {
      // Arrange
      const range = Range.create({ numericType: "integer", maxBoundType: "exclusive", min: 10, max: 20 })
      const rng = Rng.create(createGeneratorStub(1 - Number.EPSILON))

      // Act
      const random = rng.random(range)

      // Assert
      expect(random).toEqual(19)
    })
  })

  describe("float", () => {
    it("should return the generator values when no range is provided", () => {
      // Arrange
      const value = 0.5
      const rng = Rng.create(createGeneratorStub(value))

      // Act
      const random = [rng.float(), rng.float(), rng.float()]

      // Assert
      expect(random).toEqual([value, value, value])
    })

    it.each([
      // Floats bigger than 1
      { value: 0, expected: 10, min: 10, max: 20 },
      { value: 0.35, expected: 13.5, min: 10, max: 20 },
      { value: 0.5, expected: 15, min: 10, max: 20 },
      { value: 0.65, expected: 16.5, min: 10, max: 20 },
      { value: 1 - Number.EPSILON, expected: 20, min: 10, max: 20 }, // An example where float range is inclusive because of floating point errors
      // Floats smaller than 1
      { value: 0, expected: 0.3, min: 0.3, max: 0.7 },
      { value: 0.35, expected: 0.43999999999999995, min: 0.3, max: 0.7 },
      { value: 0.5, expected: 0.5, min: 0.3, max: 0.7 },
      { value: 0.65, expected: 0.56, min: 0.3, max: 0.7 },
      { value: 1 - Number.EPSILON, expected: 0.6999999999999998, min: 0.3, max: 0.7 },
    ])("should return values in the range when min and max are different", ({ value, expected, min, max }) => {
      // Arrange
      const range = Range.create({ numericType: "float", maxBoundType: "inclusive", min, max })
      const rng = Rng.create(createGeneratorStub(value))

      // Act
      const random = rng.float(range)

      // Assert
      expect(random).toEqual(expected)
    })

    it.each([0, 0.25, 0.5, 0.75, 1 - Number.EPSILON])(
      "should return exactly the min when a range is provided and min is equal to max",
      (value) => {
        // Arrange
        const range = Range.create({ numericType: "float", maxBoundType: "inclusive", min: 10, max: 10 })
        const rng = Rng.create(createGeneratorStub(value))

        // Act
        const random = rng.float(range)

        // Assert
        expect(random).toEqual(range.min)
      },
    )

    it.each([0, 0.25, 0.5, 0.75, 1 - Number.EPSILON])("should return exactly 1 when min and max are 1", (value) => {
      // Arrange
      const range = Range.create({ numericType: "float", maxBoundType: "inclusive", min: 1, max: 1 })
      const rng = Rng.create(createGeneratorStub(value))

      // Act
      const random = rng.float(range)

      // Assert
      expect(random).toEqual(range.min)
    })
  })

  describe("int", () => {
    describe("inclusive", () => {
      it.each([
        { value: 0, expected: 10 },
        { value: 0.35, expected: 13 },
        { value: 0.5, expected: 15 },
        { value: 0.65, expected: 17 },
        { value: 1 - Number.EPSILON, expected: 20 },
      ])("should return values in the range when min and max are different", ({ value, expected }) => {
        // Arrange
        const range = Range.create({ numericType: "integer", maxBoundType: "inclusive", min: 10, max: 20 })
        const rng = Rng.create(createGeneratorStub(value))

        // Act
        const random = rng.int(range)

        // Assert
        expect(random).toEqual(expected)
      })

      it.each([0, 0.25, 0.5, 0.75, 1 - Number.EPSILON])(
        "should return exactly the min when a range is provided and min is equal to max",
        (value) => {
          // Arrange
          const range = Range.create({ numericType: "integer", maxBoundType: "inclusive", min: 10, max: 10 })
          const rng = Rng.create(createGeneratorStub(value))

          // Act
          const random = rng.int(range)

          // Assert
          expect(random).toEqual(range.min)
        },
      )
    })

    describe("exclusive", () => {
      it.each([
        { value: 0, expected: 10 },
        { value: 0.35, expected: 13 },
        { value: 0.5, expected: 15 },
        { value: 0.65, expected: 16 },
        { value: 1 - Number.EPSILON, expected: 19 },
      ])("should return values in the range when min and max are different", ({ value, expected }) => {
        // Arrange
        const range = Range.create({ numericType: "integer", maxBoundType: "exclusive", min: 10, max: 20 })
        const rng = Rng.create(createGeneratorStub(value))

        // Act
        const random = rng.int(range)

        // Assert
        expect(random).toEqual(expected)
      })

      it.each([0, 0.25, 0.5, 0.75, 1 - Number.EPSILON])(
        "should return exactly the min when a range is provided and min + 1 is equal to max",
        (value) => {
          // Arrange
          const range = Range.create({ numericType: "integer", maxBoundType: "exclusive", min: 10, max: 11 })
          const rng = Rng.create(createGeneratorStub(value))

          // Act
          const random = rng.int(range)

          // Assert
          expect(random).toEqual(range.min)
        },
      )
    })
  })

  describe("shuffle", () => {
    it("should shuffle arrays in place", () => {
      // Arrange
      const initialValues = [1, 2, 3, 4, 5]
      const arrayToShuffle = initialValues.slice()
      const rng = Rng.create(mulberry32Prng(1234))

      // Act
      const shuffled = rng.shuffle(arrayToShuffle)

      // Assert
      expect(arrayToShuffle).not.toEqual(initialValues)
      expect(shuffled).toBe(arrayToShuffle)
      expect(arrayToShuffle.toSorted(Sort.byAscending)).toEqual(initialValues)
    })
  })

  describe("draw", () => {
    it("should not modify the original array", () => {
      // Arrange
      const values = [1, 2, 3, 4, 5]
      const valuesCopy = values.slice()
      const rng = Rng.create(mulberry32Prng(1234))

      // Act
      const { drawn, remaining } = rng.draw(values, 3)

      // Assert
      expect.soft(values).toEqual(valuesCopy)
      expect.soft(drawn).not.toBe(values)
      expect.soft(remaining).not.toBe(values)
    })

    it.each([1, 2, 3, 4, 5])("should randomly draw the requested amount", (count) => {
      // Arrange
      const values = [1, 2, 3, 4, 5]
      const rng = Rng.create(mulberry32Prng(1234))

      // Act
      const { drawn, remaining } = rng.draw(values, count)

      // Assert
      expect.soft(drawn.length).toEqual(count)
      expect.soft(remaining.length).toEqual(values.length - count)
    })

    it("should be deterministic given the same seed", () => {
      // Arrange
      const values = [1, 2, 3, 4, 5]
      const drawCount = 3
      const rng1 = Rng.create(mulberry32Prng(1234))
      const rng2 = Rng.create(mulberry32Prng(1234))

      // Act
      const draw1 = rng1.draw(values, drawCount)
      const draw2 = rng2.draw(values, drawCount)

      // Assert
      expect(draw1).toEqual(draw2)
    })
  })

  describe("normal", () => {
    const EXPECTED_ONE_STANDARD_DEVIATION_COVERAGE = 0.6827
    const EXPECTED_TWO_STANDARD_DEVIATIONS_COVERAGE = 0.9545
    const generators = [
      { name: "mulberry32", create: (): Generator => mulberry32Prng(1234) },
      { name: "Math.random", create: (): Generator => createGeneratorStub(() => Math.random()) },
    ]

    it.each(generators)("should follow a standard normal distribution with $name", ({ create }) => {
      // Arrange
      const expectedMean = 0
      const expectedStandardDeviation = 1
      const sampleCount = 100_000
      const rng = Rng.create(create())

      // Act
      const values = Array.from({ length: sampleCount }, () => rng.normal())

      // Assert
      const actualMean = values.reduce((sum, value) => sum + value, 0) / sampleCount
      const actualStandardDeviation = Math.sqrt(values.reduce((sum, value) => sum + (value - actualMean) ** 2, 0) / sampleCount)
      const actualOneStandardDeviationCoverage =
        values.filter((value) => Math.abs(value - expectedMean) <= expectedStandardDeviation).length / sampleCount
      const actualTwoStandardDeviationCoverage =
        values.filter((value) => Math.abs(value - expectedMean) <= 2 * expectedStandardDeviation).length / sampleCount

      expect.soft(actualMean).toBeCloseTo(expectedMean, 1)
      expect.soft(actualStandardDeviation).toBeCloseTo(expectedStandardDeviation, 1)
      expect.soft(actualOneStandardDeviationCoverage).toBeCloseTo(EXPECTED_ONE_STANDARD_DEVIATION_COVERAGE, 2)
      expect.soft(actualTwoStandardDeviationCoverage).toBeCloseTo(EXPECTED_TWO_STANDARD_DEVIATIONS_COVERAGE, 2)
    })

    it.each(generators)("should follow the requested distribution with $name", ({ create }) => {
      // Arrange
      const expectedMean = 10
      const expectedStandardDeviation = 2
      const sampleCount = 100_000
      const rng = Rng.create(create())

      // Act
      const values = Array.from({ length: sampleCount }, () => rng.normal(expectedMean, expectedStandardDeviation))

      // Assert
      const actualMean = values.reduce((sum, value) => sum + value, 0) / sampleCount
      const actualStandardDeviation = Math.sqrt(values.reduce((sum, value) => sum + (value - actualMean) ** 2, 0) / sampleCount)
      const actualOneStandardDeviationCoverage =
        values.filter((value) => Math.abs(value - expectedMean) <= expectedStandardDeviation).length / sampleCount
      const actualTwoStandardDeviationCoverage =
        values.filter((value) => Math.abs(value - expectedMean) <= 2 * expectedStandardDeviation).length / sampleCount

      expect.soft(actualMean).toBeCloseTo(expectedMean, 1)
      expect.soft(actualStandardDeviation).toBeCloseTo(expectedStandardDeviation, 1)
      expect.soft(actualOneStandardDeviationCoverage).toBeCloseTo(EXPECTED_ONE_STANDARD_DEVIATION_COVERAGE, 2)
      expect.soft(actualTwoStandardDeviationCoverage).toBeCloseTo(EXPECTED_TWO_STANDARD_DEVIATIONS_COVERAGE, 2)
    })

    it("should apply the requested mean and standard deviation to a spare value", () => {
      // Arrange
      const generatorValues = [0.5, 0.2]
      const rng = Rng.create({
        // oxlint-disable-next-line typescript/no-non-null-assertion -- we have 2 values
        next: () => generatorValues.shift()!,
        getState: () => null,
      })

      // Act
      const firstValue = rng.normal(10, 2)
      const secondValue = rng.normal(100, 3)

      // Assert
      expect(firstValue).toBeCloseTo(12.23956694852913)
      expect(secondValue).toBeCloseTo(101.09151911891401)
    })
  })
})
