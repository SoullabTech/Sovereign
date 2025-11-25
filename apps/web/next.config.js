// next.config.js - Enhanced Configuration for IPFS and Hybrid Deployment
const isProd = process.env.NODE_ENV === "production";
const isIPFS = process.env.DEPLOY_TARGET === "ipfs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript and ESLint - ignore errors for quick deployment
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Static export configuration for IPFS
  output: isIPFS ? "export" : undefined,
  trailingSlash: isIPFS ? true : false,
  skipTrailingSlashRedirect: isIPFS ? true : false,
  distDir: isIPFS ? "dist" : ".next",

  // Images configuration
  images: {
    unoptimized: isIPFS ? true : false,
    domains: ["oracle-backend-1.onrender.com"],
  },

  // Asset prefix for IPFS
  assetPrefix: isProd && isIPFS ? "./" : "",

  // Proxy backend requests through Next.js for seamless dev experience
  async rewrites() {
    // Skip rewrites for IPFS static export
    if (isIPFS) return [];
    
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:3002/api/:path*", // proxy to Maya backend
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://oracle-backend-1.onrender.com",
    FIRE_AGENT_ENDPOINT:
      process.env.FIRE_AGENT_ENDPOINT || "http://localhost:3001",
    WATER_AGENT_ENDPOINT:
      process.env.WATER_AGENT_ENDPOINT || "http://localhost:3002",
    EARTH_AGENT_ENDPOINT:
      process.env.EARTH_AGENT_ENDPOINT || "http://localhost:3003",
    AIR_AGENT_ENDPOINT:
      process.env.AIR_AGENT_ENDPOINT || "http://localhost:3004",
    AETHER_AGENT_ENDPOINT:
      process.env.AETHER_AGENT_ENDPOINT || "http://localhost:3005",
  },

  // Security Headers for Cross-Browser Compatibility
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: isProd ? 'max-age=31536000; includeSubDomains; preload' : ''
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), payment=()'
          },
          // CORS headers for cross-browser compatibility
          {
            key: 'Access-Control-Allow-Origin',
            value: isProd ? 'https://soullab.life' : '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          // Cache control for better performance
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Special headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: isProd ? 'https://soullab.life' : '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          }
        ]
      }
    ]
  },

  // Optimize for deployment
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Ignore ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ensure CSS is processed correctly
  experimental: {
    optimizeCss: true,
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Webpack configuration for IPFS compatibility
  webpack: (config, { isServer }) => {
    if (isIPFS && !isServer) {
      config.output.publicPath = "./";
    }
    return config;
  },
};

module.exports = nextConfig;
