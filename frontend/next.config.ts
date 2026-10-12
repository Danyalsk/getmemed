import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // API contracts are imported from ../backend/src/contracts (single source of truth).
    root: path.join(__dirname, ".."),
    // Contracts import zod; resolve it from this app so the bundle has one copy and
    // the build doesn't need backend/node_modules installed.
    resolveAlias: { zod: "./node_modules/zod" },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
