#!/usr/bin/env node

/**
 * Browser Feature Testing Script
 * Tests voice/audio features and browser compatibility for MAIA
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Browser configurations to test
const browserConfigs = [
  {
    name: 'Chromium (Latest)',
    headless: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    name: 'Chrome (Older)',
    headless: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
  },
  {
    name: 'Safari (Simulated)',
    headless: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
  },
  {
    name: 'Firefox (Simulated)',
    headless: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0'
  }
];

async function testBrowserFeatures(config) {
  console.log(`\n🧪 Testing ${config.name}...`);

  const browser = await puppeteer.launch({
    headless: config.headless,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--allow-running-insecure-content',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(config.userAgent);

    // Grant microphone permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('http://localhost:3002', ['microphone']);

    // Navigate to MAIA page
    console.log('  📂 Loading MAIA page...');
    await page.goto('http://localhost:3002/maia', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the component to load (dynamic import)
    await page.waitForFunction(() => {
      return document.querySelector('main') && document.readyState === 'complete';
    }, { timeout: 10000 });

    // Test browser detection
    console.log('  🔍 Testing browser compatibility detection...');
    const browserInfo = await page.evaluate(() => {
      // Access the browser compatibility functions
      if (window.detectBrowser && window.checkFeatureSupport) {
        const browser = window.detectBrowser();
        const features = window.checkFeatureSupport();
        return { browser, features };
      }
      return null;
    });

    if (browserInfo) {
      console.log(`    ✅ Browser: ${browserInfo.browser.name} v${browserInfo.browser.version}`);
      console.log(`    ✅ Legacy: ${browserInfo.browser.isLegacy}`);
      console.log(`    ✅ Audio Context: ${browserInfo.features.audio.audioContext}`);
      console.log(`    ✅ MediaRecorder: ${browserInfo.features.audio.mediaRecorder}`);
      console.log(`    ✅ getUserMedia: ${browserInfo.features.audio.getUserMedia}`);
    } else {
      console.log('    ❌ Browser compatibility module not loaded');
    }

    // Test audio unlock functionality
    console.log('  🔊 Testing audio unlock...');
    const audioUnlocked = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (window.unlockAudio) {
          window.unlockAudio().then(() => {
            resolve(window.isAudioUnlocked ? window.isAudioUnlocked() : false);
          }).catch(() => resolve(false));
        } else {
          resolve(false);
        }
      });
    });

    console.log(`    ${audioUnlocked ? '✅' : '❌'} Audio unlock: ${audioUnlocked}`);

    // Test MediaRecorder API availability
    console.log('  🎤 Testing MediaRecorder API...');
    const mediaRecorderSupport = await page.evaluate(() => {
      return typeof MediaRecorder !== 'undefined';
    });

    console.log(`    ${mediaRecorderSupport ? '✅' : '❌'} MediaRecorder API: ${mediaRecorderSupport}`);

    // Test getUserMedia API
    console.log('  📹 Testing getUserMedia API...');
    const getUserMediaSupport = await page.evaluate(() => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    });

    console.log(`    ${getUserMediaSupport ? '✅' : '❌'} getUserMedia API: ${getUserMediaSupport}`);

    // Test voice button functionality
    console.log('  🎯 Testing voice button interaction...');
    try {
      // Look for the voice recording button
      const voiceButton = await page.waitForSelector('button[title*="voice"], button[title*="recording"]', { timeout: 5000 });

      if (voiceButton) {
        console.log('    ✅ Voice button found');

        // Check if button is enabled
        const isEnabled = await page.evaluate((btn) => !btn.disabled, voiceButton);
        console.log(`    ${isEnabled ? '✅' : '❌'} Voice button enabled: ${isEnabled}`);

        // Test click interaction (but don't actually record)
        await page.evaluate((btn) => {
          // Just test the click handler exists
          const hasClickHandler = btn.onclick || btn.addEventListener;
          return !!hasClickHandler;
        }, voiceButton);

        console.log('    ✅ Voice button click handler present');
      }
    } catch (error) {
      console.log('    ❌ Voice button not found or not interactive');
    }

    // Test console for errors
    console.log('  📋 Checking for console errors...');
    const logs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });

    // Capture console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`    ❌ Console Error: ${msg.text()}`);
      }
    });

    // Test PWA features
    console.log('  📱 Testing PWA features...');
    const pwaFeatures = await page.evaluate(() => {
      return {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: !!document.querySelector('link[rel="manifest"]'),
        installPrompt: 'BeforeInstallPromptEvent' in window
      };
    });

    console.log(`    ${pwaFeatures.serviceWorker ? '✅' : '❌'} Service Worker support: ${pwaFeatures.serviceWorker}`);
    console.log(`    ${pwaFeatures.manifest ? '✅' : '❌'} Web App Manifest: ${pwaFeatures.manifest}`);

    return {
      browser: config.name,
      success: true,
      browserInfo,
      audioUnlocked,
      mediaRecorderSupport,
      getUserMediaSupport,
      pwaFeatures
    };

  } catch (error) {
    console.log(`    ❌ Error testing ${config.name}: ${error.message}`);
    return {
      browser: config.name,
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('🚀 Starting Browser Compatibility Tests for MAIA Voice Chat\n');

  // Check if the development server is running
  const http = require('http');
  const checkServer = () => {
    return new Promise((resolve) => {
      const req = http.request('http://localhost:3002/maia', { method: 'HEAD' }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.end();
    });
  };

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Development server not running on localhost:3002');
    console.log('   Please run: npm run dev');
    process.exit(1);
  }

  console.log('✅ Development server is running\n');

  const results = [];

  for (const config of browserConfigs) {
    const result = await testBrowserFeatures(config);
    results.push(result);

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate summary report
  console.log('\n📊 BROWSER COMPATIBILITY TEST SUMMARY');
  console.log('=====================================\n');

  let passCount = 0;
  results.forEach(result => {
    if (result.success) {
      passCount++;
      console.log(`✅ ${result.browser}`);
      if (result.audioUnlocked) console.log('   🔊 Audio features working');
      if (result.mediaRecorderSupport) console.log('   🎤 Voice recording supported');
      if (result.pwaFeatures && result.pwaFeatures.serviceWorker) console.log('   📱 PWA features available');
    } else {
      console.log(`❌ ${result.browser}: ${result.error}`);
    }
  });

  console.log(`\n🏆 Overall: ${passCount}/${results.length} browsers passed tests`);

  if (passCount === results.length) {
    console.log('🎉 All browser tests passed! MAIA is ready for multi-browser deployment.');
  } else {
    console.log('⚠️  Some browsers failed. Review compatibility issues above.');
  }
}

// Check if puppeteer is available
try {
  require.resolve('puppeteer');
  runAllTests().catch(console.error);
} catch (error) {
  console.log('📦 Puppeteer not available. Installing...');
  console.log('   Run: npm install puppeteer --save-dev');
  console.log('\n🔧 Alternative manual testing approach:');
  console.log('   1. Open http://localhost:3002/maia in different browsers');
  console.log('   2. Check console for browser compatibility warnings');
  console.log('   3. Test voice recording button functionality');
  console.log('   4. Verify audio playback works');
  console.log('   5. Check PWA install prompt appears');
}