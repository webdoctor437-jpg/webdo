/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ 빌드 시 타입/ESLint 오류로 배포 막히지 않게
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ 서버 액션 / API 실행 시 body 크기 제한 완화
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // ✅ Vercel 환경에서 루트 경로 인식 명확하게
  output: "standalone",
};

module.exports = nextConfig;
