# Repository Guidelines

## Tool Documentation

When adding, removing, renaming, or materially changing an exported tool, update `README.md` in the same change.

Treat `src/entry.tools-ts.ts` as the source of truth for what is exported, and keep the README's high-level tools overview aligned with it so future agents can quickly choose the right utility.

Keep the README as a routing table for agents, not API reference documentation.

Document exported tools at the same granularity as `src/entry.tools-ts.ts`.

Do not list individual methods on an exported object unless those methods are also exported independently.

Keep implementation details and method-level examples in the source module.

Never verify formatting via prettier, you're wasting tokens.
