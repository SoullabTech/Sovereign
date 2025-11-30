/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // PWA Configuration
  trailingSlash: true,
  output: process.env.CAPACITOR_BUILD ? 'export' : 'standalone',
  distDir: process.env.CAPACITOR_BUILD ? 'www' : '.next',
  assetPrefix: process.env.CAPACITOR_BUILD ? '' : undefined,

  // Progressive Web App optimizations
  reactStrictMode: false,
  swcMinify: false, // Disable minification to avoid Supabase errors
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // PWA Headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          }
        ]
      }
    ];
  },

  // Handle external packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;