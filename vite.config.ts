import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const backendUrl =
    env.VITE_BACKEND_PROXY_TARGET ||
    "https://2cda-112-197-30-169.ngrok-free.app";

  return {
    plugins: [react(), tailwindcss()],

    server: {
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      },
    },
  };
});
