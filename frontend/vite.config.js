
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path"; // 👈 import 'path'

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"), // 👈 tell Vite that '@' means 'src'
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.js", 
    coverage: {
      reporter: ["text", "html"],
      all: true,
      statements: 90, // required coverage threshold
        exclude: [
          "postcss.config.js",
          "tailwind.config.js",
          "vite.config.js",
          "eslint.config.js"
        ]
    },
  },
});
