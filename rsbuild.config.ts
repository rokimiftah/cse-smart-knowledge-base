import path from "node:path";

import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    meta: {
      description:"CSE Smart Knowledge Base"
    },
    favicon: "",
    title: "SerpApi - CSE Smart Knowledge Base",
  },

  output: {
    assetPrefix: "/",
  },

  performance: {
    removeConsole: true,
  },

  plugins: [pluginReact()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "src/app"),
      "@features": path.resolve(__dirname, "src/features"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },

  server: {
    host: "localhost",
    port: 3000,
  },

  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },
});
