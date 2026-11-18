import { typescript, vitest } from "@guillaume-docquier/oxlint"
import { defineConfig } from "oxlint"

export default defineConfig({
  extends: [typescript],
  options: {
    reportUnusedDisableDirectives: "error",
    denyWarnings: true,
  },
  ignorePatterns: ["*.gen.*"],
  overrides: [
    {
      files: ["entry.tools-ts.ts"],
      rules: {
        "oxc/no-barrel-file": "off", // it's the only allowed barrel file
      },
    },
    {
      ...vitest,
      files: ["**/*.test.ts"],
    },
  ],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: "(^|/)entry\\.tools-ts(\\.(js|ts|d\\.ts))?$",
            message: "Import directly from the module that defines the export.",
          },
        ],
      },
    ],
  },
})
