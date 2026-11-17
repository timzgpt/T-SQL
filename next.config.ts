import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `npm run build` produces /out — host it anywhere (IIS, Nginx, GitHub Pages, Vercel).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
