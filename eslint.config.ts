import { defineConfig, globalIgnores } from "eslint/config"
import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores(["**/dist/**", "**/coverage/**", "*.gen.*"]),
  { files: ["**/*.ts"], plugins: { js }, extends: ["js/recommended"] },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          // We don't allow ignoring caught errors, as it's a bad idea to swallow errors
        },
      ],
    },
  },
])
