import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/',                // critical for Vercel
  plugins: [react()],
  server: {
    host: true,
    port: 12000,
    proxy: {
      '/api': {
        target: 'http://localhost:12000',
        changeOrigin: true,
      }
    }
  }
});
