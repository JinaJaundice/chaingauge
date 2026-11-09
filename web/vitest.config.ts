import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The rating logic (band derivation, rosette geometry) is pure functions, so a
// node environment is enough. Kept separate from vite.config.ts, so the
// `@shared` alias has to be repeated here: it points at the code the site and
// the serverless function both use, which lives under `api/_lib`.
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  resolve: { alias: { "@shared": `${repoRoot}api/_lib` } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
