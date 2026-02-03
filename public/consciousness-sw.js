/**
 * Consciousness Computing Service Worker
 * Offline-capable consciousness computing with Matrix V2 assessment
 */

const CONSCIOUSNESS_CACHE = 'consciousness-v3';
const CONSCIOUSNESS_VERSION = '3.0.0'; // Memory patterns UI - Dec 31 2024

// Core consciousness computing files
const CONSCIOUSNESS_FILES = [
  // Core consciousness computing
  '/lib/consciousness-computing/matrix-v2-implementation.js',
  '/lib/consciousness-computing/nested-window-architecture.js',
  '/lib/consciousness-computing/platonic-mind-integration.js',
  '/lib/consciousness-computing/mobile-integration.js',
  '/lib/consciousness-computing/integration-test.js',

  // Spiritual support
  '/lib/spiritual-support/maia-spiritual-integration.js',
  '/lib/spiritual-support/context-detection-system.js',

  // Faith integration
  '/lib/faith-integration/types.js',

  // Consciousness computing interfaces
  '/consciousness-computing',
  '/consciousness-computing/assessment',
  '/consciousness-computing/windows',
  '/consciousness-computing/spiritual',
  '/consciousness-computing/patterns',

  // Essential app files
  '/',
  '/maya',
  '/maia',
  '/maia/labtools',
  '/manifest.json',
  '/consciousness-manifest.json',

  // Memory patterns UI (Show Why)
  '/api/memory/patterns',

  // Icons and assets
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Install event - cache consciousness computing files
self.addEventListener('install', (event) => {
  console.log('🧠 Installing Consciousness Computing Service Worker');

  event.waitUntil(
    caches.open(CONSCIOUSNESS_CACHE).then((cache) => {
      return cache.addAll(CONSCIOUSNESS_FILES).then(() => {
        console.log('✅ Consciousness computing files cached successfully');
        return self.skipWaiting();
      }).catch((error) => {
        console.error('❌ Failed to cache consciousness files:', error);
        // Continue with partial cache - consciousness computing should work offline with basic features
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🧠 Activating Consciousness Computing Service Worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CONSCIOUSNESS_CACHE) {
            console.log('🧹 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve consciousness computing from cache when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle consciousness computing requests
  if (url.pathname.includes('/consciousness-computing/') ||
      url.pathname.includes('/lib/consciousness-computing/') ||
      url.pathname.includes('/lib/spiritual-support/') ||
      url.pathname.includes('/lib/faith-integration/')) {

    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('🧠 Serving consciousness computing from cache:', url.pathname);
          return response;
        }

        // Try to fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Cache the response for future offline use
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CONSCIOUSNESS_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Offline fallback for consciousness computing
          return generateOfflineConsciousnessResponse(url.pathname);
        });
      })
    );
    return;
  }

  // Handle API requests with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return generateOfflineAPIResponse(url.pathname);
      })
    );
    return;
  }

  // Handle main navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          return caches.match('/');
        });
      })
    );
    return;
  }

  // Default fetch strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Generate offline consciousness computing responses
function generateOfflineConsciousnessResponse(pathname) {
  console.log('🧠 Generating offline consciousness response for:', pathname);

  const offlineConsciousnessData = {
    status: 'offline',
    consciousness: {
      matrix: {
        bodyState: 'calm',
        affect: 'peaceful',
        attention: 'focused',
        timeStory: 'present',
        relational: 'connected',
        culturalFrame: 'flexible',
        structuralLoad: 'stable',
        edgeRisk: 'clear',
        agency: 'empowered',
        realityContact: 'grounded',
        symbolicCharge: 'everyday',
        playfulness: 'fluid',
        relationalStance: 'with_mutual'
      },
      windowOfTolerance: 'within',
      overallCapacity: 'limited',
      primaryAttendance: 'Offline consciousness computing active',
      refinedGuidance: 'Working in offline mode - your consciousness computing continues even without network connection',
      groundRules: [
        'Trust your inner wisdom during offline consciousness work',
        'Offline mode preserves complete privacy of your consciousness data',
        'Basic consciousness assessment and spiritual support remain available'
      ]
    },
    offlineCapabilities: {
      consciousnessAssessment: true,
      spiritualSupport: true,
      patternRecognition: false,
      dataSync: 'offline_only'
    },
    message: 'Consciousness computing available offline with core features. Connect to network for enhanced capabilities.'
  };

  return new Response(JSON.stringify(offlineConsciousnessData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

// Generate offline API responses
function generateOfflineAPIResponse(pathname) {
  console.log('📡 Generating offline API response for:', pathname);

  if (pathname.includes('/consciousness/')) {
    return generateOfflineConsciousnessResponse(pathname);
  }

  const offlineResponse = {
    status: 'offline',
    message: 'This feature requires network connection. Core consciousness computing remains available offline.',
    availableOffline: [
      'Consciousness assessment',
      'Basic spiritual support',
      'Offline consciousness practices'
    ]
  };

  return new Response(JSON.stringify(offlineResponse), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

// Handle background sync for consciousness data
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'consciousness-data-sync') {
    event.waitUntil(syncConsciousnessData());
  }
});

async function syncConsciousnessData() {
  try {
    // Sync offline consciousness computing data when network returns
    const offlineData = await getOfflineConsciousnessData();
    if (offlineData.length > 0) {
      console.log('🧠 Syncing', offlineData.length, 'offline consciousness entries');

      const response = await fetch('/api/consciousness/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries: offlineData })
      });

      if (response.ok) {
        await clearOfflineConsciousnessData();
        console.log('✅ Consciousness data synced successfully');
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync consciousness data:', error);
  }
}

// Offline consciousness data management
async function getOfflineConsciousnessData() {
  // Would integrate with IndexedDB for offline consciousness data storage
  return [];
}

async function clearOfflineConsciousnessData() {
  // Would clear synced offline data from IndexedDB
}

// Handle push notifications for consciousness reminders
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');

  const options = {
    body: 'Time for your consciousness check-in',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'consciousness-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'assess',
        title: '🧠 Quick Assessment'
      },
      {
        action: 'spiritual',
        title: '✨ Spiritual Support'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.message || options.body;
    options.tag = payload.tag || options.tag;
  }

  event.waitUntil(
    self.registration.showNotification('MAIA Consciousness Computing', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);

  event.notification.close();

  let url = '/consciousness-computing';

  switch (event.action) {
    case 'assess':
      url = '/consciousness-computing?mode=assessment&source=notification';
      break;
    case 'spiritual':
      url = '/consciousness-computing?mode=spiritual&source=notification';
      break;
    default:
      url = '/consciousness-computing?source=notification';
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});

console.log('🧠 Consciousness Computing Service Worker loaded - Version', CONSCIOUSNESS_VERSION);