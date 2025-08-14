// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  eslint: {
    // 프로덕션 빌드 시 ESLint 오류 무시 (임시 조치)
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api-beta/:path*",
        destination: "https://beta.fcde.app/:path*",
      },
      {
        source: "/api-dev/:path*",
        destination: "https://dev.fcde.app/:path*",
      },
    ];
  },
};

export default nextConfig;
