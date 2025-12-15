/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint configuration moved to .eslintrc.json - no longer supported in Next.js 16
  // eslint config removed per Next.js 16 requirements
  images: {
    unoptimized: true,
  },
  // Allow mobile app to access dev server resources
  allowedDevOrigins: ['192.168.4.210:3005', '192.168.4.210', 'localhost'],
  // PWA Configuration
  trailingSlash: false,
  output: process.env.CAPACITOR_BUILD ? 'export' : 'standalone',
  distDir: process.env.CAPACITOR_BUILD ? 'out' : '.next',
  assetPrefix: process.env.CAPACITOR_BUILD ? '' : undefined,

  // Fix workspace root warning - set explicit output file tracing
  outputFileTracingRoot: __dirname,

  // Progressive Web App optimizations
  reactStrictMode: false,
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
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        // Add missing packages that should only run on server
        '@qdrant/js-client-rest': false,
        'better-sqlite3': false,
        'luxon': false,
      };
    }

    // Enhanced fix for undici library bundling issue for Node.js v22+
    config.externals = config.externals || [];
    if (isServer) {
      // More comprehensive externalization of problematic libraries
      config.externals.push({
        'undici': 'commonjs undici',
        'formdata-polyfill/esm.min.js': 'commonjs formdata-polyfill/esm.min.js',
        'node:util': 'commonjs util',
        'node:crypto': 'commonjs crypto',
        'node:stream': 'commonjs stream',
        'node:url': 'commonjs url',
        'node:zlib': 'commonjs zlib',
      });

      // Additional externalization as function for problematic packages
      if (Array.isArray(config.externals)) {
        config.externals.push(({ context, request }, callback) => {
          // Externalize any undici-related imports
          if (/^undici/.test(request) || /node:/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        });
      }
    }

    // Ignore problematic modules during bundling
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // Resolve aliases to prevent bundling issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
    };

    // 🔥 CRITICAL COMPONENT OPTIMIZATION - SacredLabDrawer & PFI System
    // Ensure SacredLabDrawer and core components are prioritized during builds
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Critical core components - high priority
          'sacred-core': {
            name: 'sacred-core',
            chunks: 'all',
            test: /[\\/]components[\\/](SacredLabDrawer|LanguageSelector)\.tsx?$/,
            priority: 100,
            enforce: true,
          },
          // MAIA page - high priority
          'maia-core': {
            name: 'maia-core',
            chunks: 'all',
            test: /[\\/]app[\\/]maia[\\/]page\.tsx?$/,
            priority: 90,
            enforce: true,
          },
          // Sacred luxury retreat onboarding - protected from removal
          'sacred-onboarding': {
            name: 'sacred-onboarding',
            chunks: 'all',
            test: /[\\/]components[\\/]onboarding[\\/](CompleteWelcomeFlow|MAIADaimonIntroduction|DaimonWelcomeRitual|SacredSoulInduction)\.tsx?$/,
            priority: 85,
            enforce: true,
          },
          // PFI consciousness system
          'pfi-system': {
            name: 'pfi-system',
            chunks: 'all',
            test: /[\\/]lib[\\/]consciousness[\\/]field[\\/]/,
            priority: 80,
            enforce: true,
          },
        },
      },
    };

    // Add webpack alias for critical components to prevent import issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components/SacredLabDrawer': require('path').resolve(__dirname, 'components/SacredLabDrawer.tsx'),
      '@/types/core-components': require('path').resolve(__dirname, 'types/core-components.ts'),
    };

    return config;
  },

  // Turbopack configuration (Next.js 16 default bundler)
  turbopack: {
    // Empty config to silence the error - most webpack configs work fine in Turbopack
  },

  // Experimental features to ensure critical components load first
  experimental: {
    optimizeCss: true,
    // Ensure SacredLabDrawer is in the critical path
    largePageDataBytes: 128 * 1000, // 128KB
  },
};

module.exports = nextConfig;