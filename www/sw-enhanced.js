// Maya Enhanced PWA Service Worker v2.0
const VERSION = 'v2.0.0';
const CACHE_NAME = `maya-${VERSION}`;
const STATIC_CACHE = `maya-static-${VERSION}`;
const RUNTIME_CACHE = `maya-runtime-${VERSION}`;
const IMAGE_CACHE = `maya-images-${VERSION}`;

// Core assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/maya',
  '/holoflower',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxEntries: 50,
  maxCacheSizeBytes: 50 * 1024 * 1024, // 50MB limit
  // Strategy per route pattern
  strategies: {
    networkFirst: [
      /^\/api\/maya/,
      /^\/api\/oracle/,
      /^\/maya/,
      /^\/$/ // Home page
    ],
    cacheFirst: [
      /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      /^\/icons\//,
      /^\/images\//,
      /^\/_next\/static\//,
      /\.(?:woff|woff2|ttf|otf)$/
    ],
    networkOnly: [
      /^\/api\/auth/,
      /^\/api\/voice/,
      /^\/api\/maya-voice/
    ],
    staleWhileRevalidate: [
      /\.(?:js|css)$/,
      /^\/_next\//,
      /^\/api\// // Default for other APIs
    ]
  }
};

// Install Event - Precache core assets
self.addEventListener('install', event => {
  console.log('🚀 Maya SW Installing:', VERSION);

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(PRECACHE_URLS.filter(url => url !== '/offline.html'));
      }),
      // Create beautiful offline page
      createOfflinePage()
    ]).then(() => {
      console.log('✅ Maya SW Install complete');
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('⚡ Maya SW Activating:', VERSION);

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              return name.startsWith('maya-') &&
                     !name.includes(VERSION);
            })
            .map(name => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Maya SW Activated');
    })
  );
});

// Fetch Event - Smart caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) return;

  // Handle PWA navigation - redirect root to /maia when in standalone mode (Claude Code enhanced)
  if (request.mode === 'navigate' && url.pathname === '/' &&
      (url.searchParams.get('utm_source') === 'homescreen' ||
       request.referrer.includes('android-app://') ||
       self.clients.matchAll().then(clients => clients.some(c => c.url.includes('standalone=true'))))) {
    event.respondWith(Response.redirect('/maia', 302));
    return;
  }

  // Determine strategy
  const strategy = getStrategy(url);

  // Apply strategy
  switch (strategy) {
    case 'networkOnly':
      event.respondWith(networkOnly(request));
      break;
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Strategy Selection
function getStrategy(url) {
  const { pathname } = url;

  for (const [strategy, patterns] of Object.entries(CACHE_CONFIG.strategies)) {
    for (const pattern of patterns) {
      if (pattern.test(pathname)) {
        return strategy;
      }
    }
  }

  return 'networkFirst'; // Default strategy
}

// Network Only - No caching
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Cache First - Serve from cache, fallback to network
async function cacheFirst(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Refresh cache in background
    fetchAndCache(request, cache);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      await safeCachePut(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Network First - Try network, fallback to cache
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      // Check quota before caching
      await safeCachePut(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Stale While Revalidate - Serve cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(async response => {
    if (response.ok && request.method === 'GET') {
      await safeCachePut(cache, request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// Safe cache put with quota handling
async function safeCachePut(cache, request, response) {
  try {
    await cache.put(request, response);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ Cache quota exceeded, clearing oldest entries...');
      await clearOldestCacheEntries(cache);
      // Retry once after cleanup
      try {
        await cache.put(request, response);
      } catch (retryError) {
        console.error('❌ Failed to cache after cleanup:', retryError);
      }
    }
  }
}

// Clear oldest cache entries
async function clearOldestCacheEntries(cache) {
  const keys = await cache.keys();
  const keysToDelete = keys.slice(0, Math.floor(keys.length / 2)); // Delete oldest 50%

  await Promise.all(
    keysToDelete.map(key => cache.delete(key))
  );

  console.log(`🗑️ Cleared ${keysToDelete.length} cache entries`);
}

// Background fetch and cache
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      await safeCachePut(cache, request, response.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Create beautiful offline page
async function createOfflinePage() {
  const offlineHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Maya - Reconnecting</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }

    .container {
      text-align: center;
      padding: 2rem;
      max-width: 90vw;
      animation: fadeIn 0.6s ease;
    }

    .orb {
      width: 120px;
      height: 120px;
      margin: 0 auto 2rem;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
      border-radius: 50%;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: float 3s ease-in-out infinite;
      position: relative;
      overflow: hidden;
    }

    .orb::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1), transparent);
      animation: pulse 2s ease-in-out infinite;
    }

    .orb-icon {
      font-size: 50px;
      z-index: 1;
    }

    h1 {
      font-size: 2rem;
      margin: 0 0 1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    p {
      font-size: 1.1rem;
      opacity: 0.9;
      line-height: 1.6;
      margin: 0 0 2rem;
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn {
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      padding: 14px 32px;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      display: inline-block;
      -webkit-tap-highlight-color: transparent;
    }

    .btn:hover, .btn:active {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }

    @media (max-width: 380px) {
      h1 { font-size: 1.75rem; }
      p { font-size: 1rem; }
      .btn { padding: 12px 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="orb">
      <span class="orb-icon">🌙</span>
    </div>
    <h1>Reconnecting to Maya</h1>
    <p>The sacred connection is temporarily paused. Maya awaits your return to continue the conversation.</p>
    <button class="btn" onclick="handleReconnect()">Reconnect</button>
  </div>

  <script>
    // Auto-retry connection
    let retryCount = 0;
    const maxRetries = 3;

    function handleReconnect() {
      retryCount++;

      if (navigator.onLine) {
        window.location.reload();
      } else if (retryCount < maxRetries) {
        setTimeout(handleReconnect, 2000);
      }
    }

    // Listen for connection restoration
    window.addEventListener('online', () => {
      window.location.reload();
    });

    // Check periodically
    setInterval(() => {
      if (navigator.onLine) {
        fetch('/').then(() => {
          window.location.reload();
        }).catch(() => {});
      }
    }, 5000);
  </script>
</body>
</html>`;

  const cache = await caches.open(STATIC_CACHE);
  return cache.put('/offline.html', new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  }));
}

// Message handling for app communication
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    caches.open(RUNTIME_CACHE).then(cache => {
      cache.addAll(event.data.urls);
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'maya-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('📤 Syncing offline Maya conversations...');
  // Implement offline conversation sync
}

// Push notification support (future feature)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Maya has insights for you',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'maya-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open Maya' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Maya', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/maya')
    );
  }
});