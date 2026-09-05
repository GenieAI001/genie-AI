import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ command }) => {
  // PORT is only needed to run a local dev/preview server — not for `vite build`,
  // which static hosts like Vercel/Netlify invoke with no PORT env var set.
  const port = command === "serve" ? getRequiredPort() : undefined;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: port
      ? { port, host: "0.0.0.0", allowedHosts: true }
      : undefined,
    preview: port
      ? { port, host: "0.0.0.0", allowedHosts: true }
      : undefined,
  };
});

function getRequiredPort(): number {
  const rawPort = process.env.PORT;
  if (!rawPort) {
    throw new Error("PORT environment variable is required but was not provided.");
  }
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  return port;
}

