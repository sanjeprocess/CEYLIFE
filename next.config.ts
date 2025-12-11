import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Externalize vm2 to avoid bundling issues with Next.js/Turbopack
  serverComponentsExternalPackages: ["vm2"],
};

export default nextConfig;
