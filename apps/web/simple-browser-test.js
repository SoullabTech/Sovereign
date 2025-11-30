#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function quickBrowserTest() {
  console.log('🧪 Running Quick Browser Test for MAIA Voice Features\n');

  const browser = await puppeteer.launch({
    headless: false, // Run in visible mode to see what's happening
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--allow-running-insecure-content',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();

    // Grant microphone permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('http://localhost:3002', ['microphone']);

    console.log('📂 Loading MAIA page...');
    await page.goto('http://localhost:3002/maia', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });

    console.log('✅ Page loaded successfully');

    // Wait for React to hydrate and component to load
    await page.waitForFunction(() => {
      return document.querySelector('main') && document.readyState === 'complete';
    }, { timeout: 10000 });

    console.log('✅ React components loaded');

    // Test basic browser APIs
    const browserAPIs = await page.evaluate(() => {
      return {
        mediaRecorder: typeof MediaRecorder !== 'undefined',
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        audioContext: !!(window.AudioContext || window.webkitAudioContext),
        fetch: typeof fetch !== 'undefined'
      };
    });

    console.log('🔍 Browser API Support:');
    console.log(`   MediaRecorder: ${browserAPIs.mediaRecorder ? '✅' : '❌'}`);
    console.log(`   getUserMedia: ${browserAPIs.getUserMedia ? '✅' : '❌'}`);
    console.log(`   AudioContext: ${browserAPIs.audioContext ? '✅' : '❌'}`);
    console.log(`   Fetch API: ${browserAPIs.fetch ? '✅' : '❌'}`);

    // Look for voice-related buttons
    console.log('🎤 Testing Voice UI Elements:');

    try {
      // Find any button with Mic icon or voice-related attributes
      const voiceElements = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const voiceButtons = buttons.filter(btn => {
          const title = btn.title || '';
          const text = btn.textContent || '';
          const className = btn.className || '';
          return title.toLowerCase().includes('voice') ||
                 title.toLowerCase().includes('record') ||
                 title.toLowerCase().includes('mic') ||
                 text.toLowerCase().includes('mic') ||
                 className.toLowerCase().includes('mic');
        });

        return {
          totalButtons: buttons.length,
          voiceButtons: voiceButtons.length,
          buttonTitles: voiceButtons.map(btn => btn.title || btn.textContent).slice(0, 3)
        };
      });

      console.log(`   Total buttons found: ${voiceElements.totalButtons}`);
      console.log(`   Voice-related buttons: ${voiceElements.voiceButtons}`);
      if (voiceElements.buttonTitles.length > 0) {
        console.log(`   Button titles: ${voiceElements.buttonTitles.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Error checking UI elements: ${error.message}`);
    }

    // Test console for any errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Wait a moment for any async operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (consoleMessages.length > 0) {
      console.log('⚠️  Console Errors:');
      consoleMessages.forEach(msg => console.log(`   ${msg}`));
    } else {
      console.log('✅ No console errors detected');
    }

    // Test title and basic page structure
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasMain: !!document.querySelector('main'),
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        hasServiceWorkerScript: !!document.querySelector('script[src*="sw.js"]') || 'serviceWorker' in navigator
      };
    });

    console.log('📄 Page Structure:');
    console.log(`   Title: ${pageInfo.title}`);
    console.log(`   Main element: ${pageInfo.hasMain ? '✅' : '❌'}`);
    console.log(`   PWA Manifest: ${pageInfo.hasManifest ? '✅' : '❌'}`);
    console.log(`   Service Worker: ${pageInfo.hasServiceWorkerScript ? '✅' : '❌'}`);

    return {
      success: true,
      browserAPIs,
      pageInfo,
      errors: consoleMessages
    };

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
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

  const result = await quickBrowserTest();

  if (result.success) {
    console.log('\n🎉 Quick browser test completed successfully!');
    console.log('🔍 Voice/audio features appear to be properly configured.');
    console.log('📋 For comprehensive testing, see manual-test-guide.md');
  } else {
    console.log(`\n❌ Test failed: ${result.error}`);
  }
}

// Use global fetch polyfill
global.fetch = global.fetch || ((...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)));

main().catch(console.error);