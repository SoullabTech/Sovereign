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

    // Fix undici library bundling issue for Node.js v22+
    config.externals = config.externals || [];
    if (isServer) {
      // Externalize undici and related problematic libraries
      config.externals.push({
        'undici': 'commonjs undici',
        'formdata-polyfill/esm.min.js': 'commonjs formdata-polyfill/esm.min.js'
      });
    }

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

  // Experimental features to ensure critical components load first
  experimental: {
    optimizeCss: true,
    // Ensure SacredLabDrawer is in the critical path
    largePageDataBytes: 128 * 1000, // 128KB
  },
};

module.exports = nextConfig;