import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  eslint: {
    // 프로덕션 빌드 시 ESLint 오류 무시 (임시 조치)
    ignoreDuringBuilds: true,
  },
  // 다른 설정 옵션들...
};

export default nextConfig;
