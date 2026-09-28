import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    // Los tests corren como código de servidor: usar la entrada vacía de server-only.
    conditions: ["react-server"],
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
