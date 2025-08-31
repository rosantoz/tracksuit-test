import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { Port } from "../lib/utils/index.ts";

const env = {
  clientPort: Port.parse(Deno.env.get("CLIENT_PORT")),
  serverBaseUrl: String(Deno.env.get("SERVER_BASE_URL")),
  serverPort: Port.parse(Deno.env.get("SERVER_PORT")),
};

export default defineConfig({
  root: "./src",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  plugins: [react(), deno()],
  server: {
    port: env.clientPort,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "../../node_modules"],
    },
    proxy: {
      "/api": {
        target: `${env.serverBaseUrl}:${env.serverPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
