// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // ...your existing config
  test: {
    environment: "jsdom",
    globals: true,
    // add more options as needed
  },
});
