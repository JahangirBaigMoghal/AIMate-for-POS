import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"]
    }
  },
  resolve: {
    alias: {
      "@aimate/shared": fileURLToPath(new URL("./packages/shared/src/index.ts", import.meta.url)),
      "@aimate/domain": fileURLToPath(new URL("./packages/domain/src/index.ts", import.meta.url)),
      "@aimate/foodhub": fileURLToPath(new URL("./packages/foodhub/src/index.ts", import.meta.url)),
      "@aimate/rag": fileURLToPath(new URL("./packages/rag/src/index.ts", import.meta.url)),
      "@aimate/datastore": fileURLToPath(new URL("./packages/datastore/src/index.ts", import.meta.url)),
      "@aimate/payments": fileURLToPath(new URL("./packages/payments/src/index.ts", import.meta.url)),
      "@aimate/voice-tools": fileURLToPath(new URL("./packages/voice-tools/src/index.ts", import.meta.url)),
      "@aimate/telephony": fileURLToPath(new URL("./packages/telephony/src/index.ts", import.meta.url)),
      "@aimate/voice-engine": fileURLToPath(new URL("./packages/voice-engine/src/index.ts", import.meta.url))
    }
  }
});
