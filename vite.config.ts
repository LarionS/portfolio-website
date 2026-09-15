import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), {
    name: "template-dev-routes",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const request = req as typeof req & { url?: string };
        if (request.url?.split("?")[0].match(/^\/(?:templates|guides)(?:\/[^/.]+)?\/?$/)) request.url = "/templates.html";
        next();
      });
    },
  }],
  build: {
    target: "es2022",
    assetsInlineLimit: 4096,
    sourcemap: false,
    copyPublicDir: !isSsrBuild,
    rollupOptions: isSsrBuild ? undefined : { input: { main: "index.html", templates: "templates.html" } },
  },
}));
