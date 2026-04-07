import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      axios: "axios/dist/browser/axios.cjs",
    },
  },
};

export default nextConfig;
