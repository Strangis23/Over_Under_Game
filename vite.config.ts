import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub project pages: https://<user>.github.io/<repo>/
// Set VITE_BASE_PATH=/<repo>/ in CI (see .github/workflows/deploy-pages.yml)
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
});
