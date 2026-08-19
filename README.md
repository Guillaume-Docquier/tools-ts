# tools-ts

A collection of small typescript tools published to npm

## Exported Tools Overview

This package is a grab bag of focused TypeScript utilities. Use this README as the
orientation layer: it tells you which tool to reach for and when. The individual
modules contain the deeper API examples and implementation notes.

### Error Handling And Assertions

Use these tools when code needs to distinguish expected failures from broken
program assumptions.

| Export                         | What it is                                                                         | Use it when                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Result`, `Success`, `Failure` | A typed success/failure return shape plus helper constructors and guards.          | You want expected failures to be returned and handled explicitly instead of thrown. Prefer this for recoverable application outcomes.          |
| `Result.tryCatch`              | A wrapper that converts thrown or rejected non-fatal errors into `Failure`.        | You are calling code that may throw, especially third-party APIs, and want to bring it back into the `Result` flow.                            |
| `Assert`                       | Runtime assertion helpers that throw `AssertionError` and narrow TypeScript types. | TypeScript cannot express an invariant strongly enough, or test code needs a clear fatal assertion.                                            |
| `AssertionError`               | A fatal error for violated assumptions, with structured context.                   | A program invariant is broken and continuing would hide a bug or corrupt later state. Usually use `Assert` unless you need a custom assertion. |
| `FatalError`                   | Base fatal error class with an `isFatal` flag and structured context.              | An error should crash or escape normal expected-error handling. Extend this for domain-specific fatal errors.                                  |
| `Rethrow`                      | Helpers for catch blocks that should not swallow fatal errors.                     | You catch `unknown` but only intend to handle recoverable `Error` instances.                                                                   |
| `NotImplementedError`          | A fatal placeholder error with tracking context.                                   | A code path intentionally exists before the feature is implemented, and the missing work should be traceable.                                  |
| `isNodeJSError`                | Type guard for Node-style `ErrnoException` properties on `Error`.                  | You need to inspect fields like `code`, `path`, `errno`, or `syscall` after catching a Node.js error.                                          |

### Type And Value Guards

Use these tools at runtime boundaries: parsed JSON, environment variables,
external APIs, CLI input, local storage, or other unknown data.

| Export       | What it is                                                                        | Use it when                                                                                 |
| ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `TypeGuard`  | Small runtime guards for primitives, arrays, records, integers, and enum members. | You need non-throwing checks that also narrow types.                                        |
| `getEnumKey` | Looks up the enum key associated with a value.                                    | You have an enum value and need the more descriptive key for display, logs, or diagnostics. |
| `asArray`    | Normalizes a single value or array into an array.                                 | An API accepts both `T` and `T[]`, but downstream logic should iterate uniformly.           |

### Numeric Utilities

Use these tools when code needs reusable numeric operations or validated
intervals.

| Export   | What it is                                                       | Use it when                                                                                   |
| -------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Scalar` | Helpers for scalar number operations.                            | You need to constrain a number to an inclusive minimum and maximum.                           |
| `Range`  | Helpers for creating, validating, comparing, and testing ranges. | You need finite integer or float intervals with inclusive minimums and configurable maximums. |

### Sorting

Use this tool when code needs shared ordering helpers.

| Export | What it is                                     | Use it when                                                                             |
| ------ | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Sort` | Comparator helpers for common sort operations. | You want a shared sorting utility instead of rewriting compare callbacks at call sites. |

### Randomness

Use these tools when code needs injectable randomness or deterministic
pseudo-random sequences.

| Export           | What it is                                                        | Use it when                                                                           |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Rng`            | Builds a stateful RNG facade from a serializable generator.       | You need range-aware random numbers, shuffling, draws, or resumable random sequences. |
| `RngState`       | Serializable generator and cached-normal state captured by `Rng`. | You need to persist an `Rng` and resume its exact sequence later.                     |
| `Generator`      | Contract for random sources that expose their serializable state. | You provide the primitive, resumable random source used to construct an `Rng`.        |
| `mulberry32Prng` | Deterministic, resumable Mulberry32 generator factory.            | Tests, simulations, or generation code need repeatable pseudo-random sequences.       |

### Utility Types

These exports are type-only helpers for common TypeScript modeling problems.

| Export                                     | What it is                                                        | Use it when                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Branded`, `branded`                       | A nominal typing helper plus a runtime no-op for branding values. | Structurally identical values need distinct domain types, such as separate ID kinds.       |
| `ConstructorType`                          | A type for class constructors.                                    | A function accepts a class and later uses `new` or `instanceof` against it.                |
| `EnumKeyType`, `EnumValueType`, `EnumType` | Broad shapes for enum-like objects.                               | You are writing generic utilities that operate on TypeScript enums or const-object enums.  |
| `Enumify`                                  | Converts a const object into a union of its values.               | A project avoids TypeScript `enum` but wants enum-like ergonomics from `as const` objects. |
| `ValueOf`                                  | Produces a union of an object's value types.                      | You need the values of a lookup object as a type.                                          |
| `Prettify`                                 | Re-expands an object type for easier editor hovers.               | Intersections or mapped types are correct but hard to read in tooling.                     |
| `OmitOverUnion`                            | Applies `Omit` distributively across union members.               | Native `Omit` collapses a discriminated union in a way that loses member-specific fields.  |
| `PartialProperties`                        | Makes selected object properties partial, not the whole object.   | Only nested property objects should become partial while the parent shape stays required.  |
| `Mutable`                                  | Removes `readonly` from selected properties.                      | You have a narrow, deliberate mutation need. Avoid this unless there is no cleaner model.  |

### Logging

Use the logging tools when an application or library needs structured logs with
consistent context, scopes, formatting, and redaction.

| Export                      | What it is                                                                                      | Use it when                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Logger`                    | The package logger facade, backed by LogTape, with root configuration and child scoped loggers. | Application code needs to configure sinks/context, or library code needs a logger that can be configured later by the host app. |
| `createConsoleLogSink`      | Console sink factory with production-oriented defaults.                                         | You need a ready-to-use console sink with JSON lines, non-blocking writes, and secret redaction by default.                     |
| `jsonLineFormatter`         | Structured one-record-per-line log formatter.                                                   | Logs are going to production systems, aggregators, or files where machine parsing matters.                                      |
| `prettyConsoleFormatter`    | Human-readable console formatter with expandable structured context.                            | Local development needs readable console output.                                                                                |
| `RECOMMENDED_LOG_REDACTION` | Default field redaction rules for common secrets.                                               | You want a baseline set of credential and sensitive-field protections for logs.                                                 |
| `LogSink`                   | Type alias for supported logging sinks.                                                         | You are typing sink integrations or custom sink factories.                                                                      |
| `LogContext`                | Type for user-provided structured log context.                                                  | You attach serializable context to log calls or logger instances.                                                               |
| `LoggerContext`             | Type for the final context shape passed to sinks and formatters.                                | You are writing a formatter or sink and need the logger-reserved `scopes` field.                                                |
| `LogContextProvider`        | Interface for dynamic context providers.                                                        | Log context changes over time, such as the active user, request, tenant, or job.                                                |

### Runtime Utilities

Use these small utilities to keep common asynchronous and callback patterns
consistent.

| Export            | What it is                                 | Use it when                                                                     |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| `setTimeoutAsync` | Promise-based timeout helper.              | You want `await`-friendly delays that work in browser and Node environments.    |
| `debounce`        | Creates a debounced callback.              | A repeated event should trigger work only after calls have settled for a delay. |
| `noop`            | Synchronous no-op function.                | You need a safe default callback that intentionally does nothing.               |
| `asyncNoop`       | Asynchronous no-op function.               | You need a safe default async callback or hook that resolves immediately.       |
| `omit`            | Runtime equivalent of `Omit<TType, TKey>`. | You need to remove keys from an object.                                         |

### Profiling

Use these helpers for quick profiling.

| Export                  | What it is                                                          | Use it when                                                                          |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Profile.executionTime` | Wraps sync or async work and logs elapsed time.                     | You need quick timing instrumentation around a named operation.                      |
| `Profile.memoryUsage`   | Logs process memory usage in megabytes.                             | You need a snapshot of Node.js process memory for diagnostics or runtime visibility. |
| `Timer`                 | Captures performance timestamps and computes elapsed `Time` values. | You need elapsed-time measurements without logging.                                  |

### Measurements

| Export                       | What it is                                                                        | Use it when                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `Angle`, `UnitOfAngle`       | An angle measurement and its supported degree and radian units.                   | You need to represent angles and convert between degrees and radians.          |
| `Time`, `UnitOfTime`         | A time measurement and its supported units, with conversion and arithmetic tools. | You need unit-aware durations or calculations across different time units.     |
| `Distance`, `UnitOfDistance` | A distance measurement and its supported units, with conversion and comparison.   | You need unit-aware lengths, spatial comparisons, or distances between points. |
| `Point2D`, `XY`              | A two-dimensional position and its plain coordinate-value shape.                  | You need 2D positions whose axes can use and convert between distance units.   |
| `Point3D`, `XYZ`             | A three-dimensional position and its plain coordinate-value shape.                | You need 3D positions whose axes can use and convert between distance units.   |

### Date manipulations

| Export               | What it is                                 | Use it when                                                           |
| -------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `Datetime.increment` | Increments a date by a set amount of Time. | You need to increment time. Plays nicely with the `Time` measurement. |
