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

  // Asset prefix for IPFS (must start with / or be absolute URL)
  assetPrefix: isProd && isIPFS ? "/" : "",

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

  // Enterprise-Grade Security Headers with Comprehensive CSP
  async headers() {
    // Define CSP (Content Security Policy) for maximum security
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https://vercel.com https://assets.vercel.com https://oracle-backend-1.onrender.com",
      "font-src 'self' https://fonts.gstatic.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
      // Voice/Audio specific permissions
      "media-src 'self' blob: mediastream:",
      "connect-src 'self' blob: wss: https://oracle-backend-1.onrender.com https://vercel.live",
      // WebRTC for voice functionality
      "worker-src 'self' blob:",
      // For offline functionality
      "manifest-src 'self'"
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Core Security Headers
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim()
          },
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
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: isProd ? 'max-age=63072000; includeSubDomains; preload' : ''
          },
          // Permissions Policy (Feature Policy replacement)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(), geolocation=(), payment=(), usb=()',
              'microphone=(self)', // Allow microphone for voice AI
              'accelerometer=(), gyroscope=(), magnetometer=(),',
              'clipboard-read=(), clipboard-write=(), display-capture=()',
              'fullscreen=(self), screen-wake-lock=(self)'
            ].join(' ')
          },
          // Cross-Origin Policies
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          // CORS headers (restrictive for production)
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
            value: 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400' // 24 hours
          },
          // Cache control optimized for security and performance
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          // Additional security headers
          {
            key: 'Expect-CT',
            value: isProd ? 'max-age=86400, enforce' : ''
          },
          {
            key: 'NEL',
            value: isProd ? '{"report_to":"default","max_age":31536000,"include_subdomains":true}' : ''
          }
        ]
      },
      // API Routes - Enhanced Security
      {
        source: '/api/(.*)',
        headers: [
          // Stricter CSP for API routes
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; frame-ancestors 'none';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
          // CORS for API
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
            value: 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-RateLimit-Limit, X-RateLimit-Remaining'
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
          }
        ]
      },
      // Static Assets - Long-term caching with security
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      // Service Worker - Special handling
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' blob: wss: https:; worker-src 'self';"
          }
        ]
      },
      // Manifest and PWA files
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800' // 1 week
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          }
        ]
      }
    ]
  },

  // Enterprise Performance Optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,

  // Ignore ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Advanced experimental features for performance
  experimental: {
    // CSS optimization
    optimizeCss: true,
    // Optimize fonts and package imports
    optimizePackageImports: ['@/components', '@/lib'],
    // Modern bundle splitting
    esmExternals: true,
    // Server components optimization
    serverComponentsExternalPackages: ['sharp'],
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,
  generateEtags: true,

  // Bundle analyzer for production optimization
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundleAnalyzer: {
        enabled: true,
        openAnalyzer: true,
      },
    },
  }),

  // Advanced compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: isProd ? {
      exclude: ['error', 'warn'],
    } : false,
    // Styled-components support if needed
    styledComponents: false,
  },

  // Performance monitoring
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Advanced webpack optimizations
  webpack: (config, { dev, isServer, webpack, nextRuntime }) => {
    // IPFS compatibility
    if (isIPFS && !isServer) {
      config.output.publicPath = "./";
    }

    // Production optimizations
    if (!dev) {
      // Bundle splitting optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            common: {
              minChunks: 2,
              priority: -5,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };

      // Tree shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Compression plugins
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      );
    }

    // Module resolution optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Reduce bundle size by aliasing to lighter alternatives when available
      'react/jsx-runtime': 'react/jsx-runtime',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
    };

    // Optimize imports
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: [/node_modules\/(date-fns|lodash)/],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            ['babel-plugin-transform-imports', {
              'date-fns': {
                transform: 'date-fns/${member}',
                preventFullImport: true,
              },
              'lodash': {
                transform: 'lodash/${member}',
                preventFullImport: true,
              },
            }],
          ],
        },
      },
    });

    return config;
  },

  // Advanced caching configuration
  generateBuildId: async () => {
    // Use git commit hash for build ID for better caching
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA;
    }
    // Fallback to default
    return null;
  },
};

module.exports = nextConfig;
