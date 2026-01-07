import type { NextConfig } from "next";
import path from "path";

// Resolve the actual physical path of iyzipay resources, bypassing symlinks
const iyzipayLibPath = path.dirname(require.resolve('iyzipay'));
const iyzipayResourcesGlob = path.join(iyzipayLibPath, 'resources/**/*');

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['iyzipay'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  outputFileTracingIncludes: {
    '/payment/**/*': [iyzipayResourcesGlob],
    '/api/**/*': [iyzipayResourcesGlob],
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
