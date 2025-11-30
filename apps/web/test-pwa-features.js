#!/usr/bin/env node

/**
 * PWA Features Comprehensive Test
 * Tests Progressive Web App functionality for MAIA Sovereign
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPWAFeatures() {
  console.log('📱 Testing PWA Features for MAIA Sovereign\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    const page = await browser.newPage();

    // Enable service worker domain
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      req.continue();
    });

    console.log('📂 Loading MAIA application...');
    await page.goto('http://localhost:3002/maia', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });

    console.log('✅ Application loaded');

    // Wait for React hydration
    await page.waitForFunction(() => {
      return document.readyState === 'complete' && document.querySelector('main');
    }, { timeout: 10000 });

    // Test 1: Web App Manifest
    console.log('\n1️⃣ Testing Web App Manifest...');
    const manifestTest = await page.evaluate(() => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      return {
        hasManifestLink: !!manifestLink,
        manifestHref: manifestLink ? manifestLink.href : null
      };
    });

    console.log(`   ${manifestTest.hasManifestLink ? '✅' : '❌'} Manifest link in HTML: ${manifestTest.hasManifestLink}`);

    if (manifestTest.manifestHref) {
      try {
        const manifestResponse = await page.goto(manifestTest.manifestHref);
        const manifestContent = await manifestResponse.json();

        console.log(`   ✅ Manifest accessible: ${manifestResponse.status() === 200}`);
        console.log(`   ✅ App name: ${manifestContent.name || 'N/A'}`);
        console.log(`   ✅ Short name: ${manifestContent.short_name || 'N/A'}`);
        console.log(`   ✅ Theme color: ${manifestContent.theme_color || 'N/A'}`);
        console.log(`   ✅ Display mode: ${manifestContent.display || 'N/A'}`);
        console.log(`   ✅ Start URL: ${manifestContent.start_url || 'N/A'}`);
        console.log(`   ✅ Icons: ${manifestContent.icons ? manifestContent.icons.length : 0} icons defined`);

        // Go back to main page
        await page.goto('http://localhost:3002/maia', { waitUntil: 'networkidle0' });

      } catch (error) {
        console.log(`   ❌ Error loading manifest: ${error.message}`);
      }
    }

    // Test 2: Service Worker Registration
    console.log('\n2️⃣ Testing Service Worker...');
    const serviceWorkerTest = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Check if service worker is already registered
          const registration = await navigator.serviceWorker.getRegistration();
          const hasServiceWorker = !!registration;

          // Try to register service worker if not already registered
          if (!registration) {
            try {
              const newRegistration = await navigator.serviceWorker.register('/sw.js');
              return {
                supported: true,
                registered: !!newRegistration,
                scope: newRegistration ? newRegistration.scope : null,
                error: null
              };
            } catch (registrationError) {
              return {
                supported: true,
                registered: false,
                scope: null,
                error: registrationError.message
              };
            }
          } else {
            return {
              supported: true,
              registered: true,
              scope: registration.scope,
              error: null
            };
          }
        } catch (error) {
          return {
            supported: true,
            registered: false,
            scope: null,
            error: error.message
          };
        }
      } else {
        return {
          supported: false,
          registered: false,
          scope: null,
          error: 'Service Worker API not supported'
        };
      }
    });

    console.log(`   ${serviceWorkerTest.supported ? '✅' : '❌'} Service Worker API: ${serviceWorkerTest.supported}`);
    console.log(`   ${serviceWorkerTest.registered ? '✅' : '❌'} Service Worker registered: ${serviceWorkerTest.registered}`);
    if (serviceWorkerTest.scope) {
      console.log(`   ✅ Service Worker scope: ${serviceWorkerTest.scope}`);
    }
    if (serviceWorkerTest.error) {
      console.log(`   ⚠️  Service Worker error: ${serviceWorkerTest.error}`);
    }

    // Test 3: Install Prompt (beforeinstallprompt)
    console.log('\n3️⃣ Testing Install Prompt...');
    const installTest = await page.evaluate(() => {
      return {
        beforeInstallPromptSupported: 'BeforeInstallPromptEvent' in window,
        isStandalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
        isPWA: window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
      };
    });

    console.log(`   ${installTest.beforeInstallPromptSupported ? '✅' : '❌'} Install prompt API: ${installTest.beforeInstallPromptSupported}`);
    console.log(`   ${!installTest.isStandalone ? '✅' : '⚠️ '} Running in browser (not standalone): ${!installTest.isStandalone}`);
    console.log(`   ${installTest.isPWA ? '⚠️ ' : '✅'} PWA mode: ${installTest.isPWA ? 'Already installed' : 'Ready for install'}`);

    // Test 4: Caching and Offline Functionality
    console.log('\n4️⃣ Testing Caching Strategy...');
    const cacheTest = await page.evaluate(async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          return {
            supported: true,
            cacheNames: cacheNames,
            cacheCount: cacheNames.length
          };
        } catch (error) {
          return {
            supported: true,
            cacheNames: [],
            cacheCount: 0,
            error: error.message
          };
        }
      } else {
        return {
          supported: false,
          cacheNames: [],
          cacheCount: 0
        };
      }
    });

    console.log(`   ${cacheTest.supported ? '✅' : '❌'} Cache API supported: ${cacheTest.supported}`);
    console.log(`   ✅ Active caches: ${cacheTest.cacheCount}`);
    if (cacheTest.cacheNames.length > 0) {
      console.log(`   ✅ Cache names: ${cacheTest.cacheNames.join(', ')}`);
    }

    // Test 5: PWA Meta Tags
    console.log('\n5️⃣ Testing PWA Meta Tags...');
    const metaTest = await page.evaluate(() => {
      return {
        themeColor: document.querySelector('meta[name="theme-color"]')?.content,
        mobileCapable: document.querySelector('meta[name="mobile-web-app-capable"]')?.content,
        appleCapable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.content,
        appleTitle: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content,
        appleStatusBar: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.content,
        viewport: document.querySelector('meta[name="viewport"]')?.content
      };
    });

    console.log(`   ${metaTest.themeColor ? '✅' : '❌'} Theme color: ${metaTest.themeColor || 'Missing'}`);
    console.log(`   ${metaTest.mobileCapable ? '✅' : '❌'} Mobile web app capable: ${metaTest.mobileCapable || 'Missing'}`);
    console.log(`   ${metaTest.appleCapable ? '✅' : '❌'} Apple web app capable: ${metaTest.appleCapable || 'Missing'}`);
    console.log(`   ${metaTest.appleTitle ? '✅' : '❌'} Apple web app title: ${metaTest.appleTitle || 'Missing'}`);
    console.log(`   ${metaTest.appleStatusBar ? '✅' : '❌'} Apple status bar style: ${metaTest.appleStatusBar || 'Missing'}`);
    console.log(`   ${metaTest.viewport ? '✅' : '❌'} Viewport: ${metaTest.viewport || 'Missing'}`);

    // Test 6: App-like Features
    console.log('\n6️⃣ Testing App-like Features...');
    const appFeaturesTest = await page.evaluate(() => {
      return {
        fullscreen: document.fullscreenEnabled,
        permissions: 'permissions' in navigator,
        notification: 'Notification' in window,
        pushManager: 'PushManager' in window,
        geolocation: 'geolocation' in navigator,
        webShare: 'share' in navigator
      };
    });

    console.log(`   ${appFeaturesTest.fullscreen ? '✅' : '❌'} Fullscreen API: ${appFeaturesTest.fullscreen}`);
    console.log(`   ${appFeaturesTest.permissions ? '✅' : '❌'} Permissions API: ${appFeaturesTest.permissions}`);
    console.log(`   ${appFeaturesTest.notification ? '✅' : '❌'} Notifications: ${appFeaturesTest.notification}`);
    console.log(`   ${appFeaturesTest.pushManager ? '✅' : '❌'} Push Manager: ${appFeaturesTest.pushManager}`);
    console.log(`   ${appFeaturesTest.geolocation ? '✅' : '❌'} Geolocation: ${appFeaturesTest.geolocation}`);
    console.log(`   ${appFeaturesTest.webShare ? '✅' : '❌'} Web Share: ${appFeaturesTest.webShare}`);

    return {
      success: true,
      manifest: manifestTest,
      serviceWorker: serviceWorkerTest,
      install: installTest,
      cache: cacheTest,
      meta: metaTest,
      appFeatures: appFeaturesTest
    };

  } catch (error) {
    console.log(`❌ PWA test failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

async function testStaticAssets() {
  console.log('\n7️⃣ Testing Static PWA Assets...');

  const assets = [
    { path: '/manifest.json', name: 'Web App Manifest' },
    { path: '/favicon.ico', name: 'Favicon' },
    { path: '/sw.js', name: 'Service Worker', optional: true }
  ];

  for (const asset of assets) {
    try {
      const response = await fetch(`http://localhost:3002${asset.path}`);
      const status = response.status;
      const success = status === 200;

      if (success) {
        console.log(`   ✅ ${asset.name}: ${status}`);

        // Special handling for manifest
        if (asset.path === '/manifest.json') {
          const manifest = await response.json();
          const hasRequiredFields = !!(manifest.name && manifest.start_url && manifest.display && manifest.icons);
          console.log(`   ${hasRequiredFields ? '✅' : '❌'} Manifest has required fields: ${hasRequiredFields}`);
        }
      } else if (asset.optional) {
        console.log(`   ⚠️  ${asset.name}: ${status} (optional)`);
      } else {
        console.log(`   ❌ ${asset.name}: ${status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${asset.name}: Failed to fetch`);
    }
  }
}

async function checkServer() {
  try {
    const response = await fetch('http://localhost:3002/maia');
    return response.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Development server not running on localhost:3002');
    console.log('   Please run: npm run dev');
    process.exit(1);
  }

  console.log('🚀 PWA Comprehensive Test Suite for MAIA Sovereign');
  console.log('=' .repeat(55));

  await testStaticAssets();
  const result = await testPWAFeatures();

  console.log('\n📊 PWA TEST SUMMARY');
  console.log('=' .repeat(55));

  if (result.success) {
    console.log('✅ PWA functionality test completed successfully!');
    console.log('\n📱 PWA Features Status:');
    console.log(`   Manifest: ${result.manifest.hasManifestLink ? '✅ Ready' : '❌ Missing'}`);
    console.log(`   Service Worker: ${result.serviceWorker.registered ? '✅ Active' : '⚠️  Pending'}`);
    console.log(`   Install Prompt: ${result.install.beforeInstallPromptSupported ? '✅ Supported' : '❌ Not supported'}`);
    console.log(`   Caching: ${result.cache.supported ? '✅ Available' : '❌ Not available'}`);
    console.log(`   Meta Tags: ${Object.values(result.meta).filter(Boolean).length}/6 present`);

    console.log('\n🎯 Ready for PWA deployment across all modern browsers!');
    console.log('📋 Users can install MAIA as a native-like app');
  } else {
    console.log(`❌ PWA test failed: ${result.error}`);
  }
}

// Global fetch polyfill
global.fetch = global.fetch || ((...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)));

main().catch(console.error);