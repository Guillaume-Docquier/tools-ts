import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // "threads" is faster than the default "forks".
    // https://vitest.dev/guide/improving-performance.html#pool
    pool: "threads",

    // Since tech-toolbox offers only pure functions with no need for cleanups, test isolation is only detrimental.
    // https://vitest.dev/guide/improving-performance.html#test-isolation
    isolate: false,

    // We can still make use of threads, but using too many is also detrimental.
    // I found that forcing it to 3 yielded the best results on my machine.
    // A range like 1-3 or going above 3 slowed tests down.
    maxWorkers: 3,

    coverage: {
      provider: "v8",
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
      include: ["src/**/*.ts"],
      exclude: ["src/entry.tools-ts.ts"],
    },
    restoreMocks: true,
  },
})
