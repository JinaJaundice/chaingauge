import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// React 19 + Tailwind v4. Tailwind's Vite plugin scans JSX/TS for literal class
// strings, so every coloured variant lives spelled-out in lib/uiTokens.ts.
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // `@shared` is the code the site and the serverless function both use. It
  // lives under api/ because a function cannot import upwards out of its own
  // directory at runtime, and the site can reach down without trouble.
  resolve: { alias: { "@shared": `${repoRoot}api/_lib` } },
  // 5177, so it does not collide with the other local dev servers.
  server: { port: 5177, strictPort: true, fs: { allow: [repoRoot] } },
});
