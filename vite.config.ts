/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      outDir: "dist",
      tsconfigPath: "./tsconfig.app.json",
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "vitest.setup.ts"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve("src/index.ts"),
      name: "ReactChatbotComponent",
      formats: ["es", "umd"],
      fileName: (format) => `react-chatbot-component.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: [
        // ES module output
        {
          format: "es",
          entryFileNames: "react-chatbot-component.es.js",
        },
        // UMD output with proper React globals
        {
          format: "umd",
          entryFileNames: "react-chatbot-component.umd.js",
          name: "ReactChatbotComponent",
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      ],
    },
    cssCodeSplit: false,
    minify: "terser",
    sourcemap: false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
