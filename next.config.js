const { execSync } = require('child_process');

// Capture git SHA at build time — surfaced as NEXT_PUBLIC_BUILD_SHA in the client
let BUILD_SHA = 'dev';
let BUILD_DATE = new Date().toISOString().slice(0, 10);
try {
  BUILD_SHA = execSync('git rev-parse --short HEAD', { stdio: ['pipe', 'pipe', 'ignore'] })
    .toString()
    .trim();
} catch {
  // Not a git repo or git unavailable — keep 'dev'
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Member surface ≠ admin/monitor surface. Next's dev indicator (the "N" pill
  // with issue/build-activity counts) is a diagnostic artifact and does not
  // belong in the ambient field, even during local dev. Diagnostics remain
  // available via devtools/console; they should never be ambient chrome.
  // See: docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md (observable on intent,
  // invisible by default).
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BUILD_SHA: BUILD_SHA,
    NEXT_PUBLIC_BUILD_DATE: BUILD_DATE,
  },
  typescript: {
    // Use core tsconfig for build - real ship entrypoints (app/**, components, hooks)
    // Excludes _backend, labtools, and tests
    tsconfigPath: 'tsconfig.core.json',
    // TODO: Enable strict checking after fixing pre-existing type errors
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

  // PWA Headers - only for web builds (not compatible with static export for Capacitor)
  ...(process.env.CAPACITOR_BUILD ? {} : {
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
          source: '/consciousness-sw.js',
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
    // Legacy /maia/* world URLs — the rail was remapped to the canonical
    // homes of each world, but old bookmarks and external links should
    // still resolve. Permanent (308) so clients cache the new location.
    //
    // /now-what/pitch — the Now What? pitch deck (Larry Closs program), served
    // from public/now-what/index.html with a clean address. The pitch was
    // demoted OUT of the entry path (2026-07-08): /now-what now redirects
    // straight into the live room (see redirects() below) so a person here to
    // practice lands in the practice, not a slideshow. Prospects get the deck
    // at /now-what/pitch. Plain-array rewrites are afterFiles: if an app route
    // at app/now-what/pitch/page.tsx ever ships, it takes precedence and this
    // rewrite becomes inert — no collision.
    async rewrites() {
      return [
        {
          source: '/now-what/pitch',
          destination: '/now-what/index.html',
        },
      ];
    },
    // NOTE: redirects defined here run at the Next.js edge layer, BEFORE
    // any route prerendering. This is the only reliable way to emit a
    // true 308 for paths whose "page" would otherwise be collapsed into a
    // cached HTML response by the static optimizer. Do not try to express
    // these as page-level permanentRedirect() — the optimizer will cache
    // the HTML and the browser will receive 200 instead of 308.
    async redirects() {
      return [
        // Spelling aliases for the Now What? door — /whatnow and /what-now are
        // what a person types from memory (the founder did, 2026-07-10). They
        // land on the canonical entry, which then routes to the room. NOT
        // permanent: aliases follow the entry, they don't cache-pin it.
        {
          source: '/whatnow',
          destination: '/now-what',
          permanent: false,
        },
        {
          source: '/what-now',
          destination: '/now-what',
          permanent: false,
        },
        // /now-what — room as entry (2026-07-08). The front door of the
        // Now What? field is the live room, not the pitch slideshow. Redirects
        // run BEFORE middleware, so the unauthenticated flow composes cleanly:
        // /now-what → 307 /now-what/room → middleware auth gate →
        // /signin?next=/now-what/room → back into the room, signed in.
        // NOT permanent: entry-flow design decision, don't 308-cache it.
        {
          source: '/now-what',
          destination: '/now-what/room',
          permanent: false,
        },
        // /begin was deprecated 2026-05-16 in favor of /signin as the
        // canonical threshold/auth surface. Page-level redirect() did not
        // work here for the reasons noted above — the page was statically
        // optimized and served as 200 with the NEXT_REDIRECT digest
        // serialized into the body instead of a true 307/308.
        {
          source: '/begin',
          destination: '/signin',
          permanent: true,
        },
        {
          source: '/maia/patterns',
          destination: '/worlds/patterns',
          permanent: true,
        },
        {
          source: '/maia/journal',
          destination: '/labtools/journal',
          permanent: true,
        },
        {
          source: '/maia/wisdom',
          destination: '/wisdom-keepers/wisdom',
          permanent: true,
        },
        {
          source: '/community/library',
          destination: '/maia/community/library',
          permanent: true,
        },
        // Relational Field — moved out of the Jade Neural Command shell
        // (app/dashboard/*) into its own top-level route so it no longer
        // inherits a layout reserved for future Neural tech integration.
        // Also catches the short-lived /maia/relationships whisper shell.
        {
          source: '/dashboard/relationships',
          destination: '/relationships',
          permanent: true,
        },
        {
          source: '/dashboard/relationships/:id',
          destination: '/relationships/:id',
          permanent: true,
        },
        {
          source: '/maia/relationships',
          destination: '/relationships',
          permanent: true,
        },
      ];
    }
  }),

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
        dns: false,
        // Add missing packages that should only run on server
        '@qdrant/js-client-rest': false,
        'better-sqlite3': false,
        'luxon': false,
        pg: false,
        'pg-native': false,
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
        // pdf-parse v2 ships "type": "module" with a .cjs main entry, which
        // webpack's RSC interop layer can't reconcile (Object.defineProperty
        // on non-object error). Externalize so it loads via require() at
        // runtime instead of going through the bundler.
        'pdf-parse': 'commonjs pdf-parse',
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

    // Handle undici in resolve.fallback instead of alias to avoid breaking Next.js internals
    if (!isServer) {
      config.resolve.fallback.undici = false;
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
    // Use Object.assign to avoid overwriting Next.js internal aliases
    Object.assign(config.resolve.alias, {
      '@/components/SacredLabDrawer': require('path').resolve(__dirname, 'components/SacredLabDrawer.tsx'),
      '@/types/core-components': require('path').resolve(__dirname, 'types/core-components.ts'),
    });

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
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

module.exports = nextConfig;