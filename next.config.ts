import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['iyzipay'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // @ts-expect-error outputFileTracingIncludes is a valid config but missing in some type definitions
    outputFileTracingIncludes: {
      '/payment/**/*': ['./node_modules/iyzipay/lib/resources/**/*'],
      '/api/**/*': ['./node_modules/iyzipay/lib/resources/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  }
};

export default nextConfig;
