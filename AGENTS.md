# Repository Guidelines

## Tool Documentation

When adding, removing, renaming, or materially changing an exported tool, update `README.md` in the same change.

Treat `src/entry.tools-ts.ts` as the source of truth for what is exported, and keep the README's high-level tools overview aligned with it so future agents can quickly choose the right utility.

Keep the README as a routing table for agents, not API reference documentation.

Document exported tools at the same granularity as `src/entry.tools-ts.ts`.

Do not list individual methods on an exported object unless those methods are also exported independently.

Keep implementation details and method-level examples in the source module.

Never verify formatting via prettier, you're wasting tokens.

## Testing

- Test production code. Do not use `vitest.mock()`.
- Structure unit tests using Arrange, Act, Assert, with explicit `// Arrange`, `// Act`, and `// Assert` sections in that order. `// Act & Assert` is acceptable for synchronous calls that throw and for genuinely complex routines where splitting the phases would make the test harder to understand.
- Optimize assertions for useful failure output: compare semantic values instead of opaque IDs, sort unordered collections before comparison, and keep setup control flow straightforward.
- Create expected state explicitly. Do not reimplement production logic in tests to compute expected results.
