import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Fonts and PDF templates are read from disk at runtime (process.cwd()/assets):
  // make sure the serverless bundles ship them.
  outputFileTracingIncludes: {
    "/api/tickets/\\[code\\]/pdf": ["./assets/fonts/*.ttf", "./assets/tickets/*.pdf"],
    "/\\[lang\\]/opengraph-image": ["./assets/fonts/*.ttf"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
