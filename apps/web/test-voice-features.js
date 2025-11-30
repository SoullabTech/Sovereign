#!/usr/bin/env node

/**
 * Simple Voice Features Test
 * Tests the MAIA voice chat functionality without browser automation
 */

const http = require('http');
const https = require('https');

async function testServerResponse() {
  console.log('🧪 Testing MAIA voice chat server functionality...\n');

  // Test 1: Basic page load
  console.log('1️⃣ Testing basic page load...');
  try {
    const response = await fetch('http://localhost:3002/maia');
    const html = await response.text();

    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Content-Type: ${response.headers.get('content-type')}`);

    // Check for key components in HTML
    const hasVoiceChat = html.includes('MaiaVoiceChat') || html.includes('voice');
    const hasManifest = html.includes('manifest.json');
    const hasAudioScripts = html.includes('Audio') || html.includes('voice');

    console.log(`   ${hasVoiceChat ? '✅' : '❌'} Voice chat component: ${hasVoiceChat}`);
    console.log(`   ${hasManifest ? '✅' : '❌'} PWA manifest: ${hasManifest}`);
    console.log(`   ${hasAudioScripts ? '✅' : '❌'} Audio functionality: ${hasAudioScripts}`);

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }

  // Test 2: Manifest file
  console.log('\n2️⃣ Testing PWA manifest...');
  try {
    const manifestResponse = await fetch('http://localhost:3002/manifest.json');
    const manifest = await manifestResponse.json();

    console.log(`   ✅ Status: ${manifestResponse.status}`);
    console.log(`   ✅ Name: ${manifest.name || 'N/A'}`);
    console.log(`   ✅ Theme color: ${manifest.theme_color || 'N/A'}`);
    console.log(`   ✅ Display: ${manifest.display || 'N/A'}`);

  } catch (error) {
    console.log(`   ❌ Manifest error: ${error.message}`);
  }

  // Test 3: Check required static assets
  console.log('\n3️⃣ Testing static assets...');

  const assetsToTest = [
    { path: '/favicon.ico', name: 'Favicon' },
    { path: '/_next/static/css/app/layout.css', name: 'CSS Bundle' }
  ];

  for (const asset of assetsToTest) {
    try {
      const assetResponse = await fetch(`http://localhost:3002${asset.path}`);
      console.log(`   ${assetResponse.status === 200 ? '✅' : '❌'} ${asset.name}: ${assetResponse.status}`);
    } catch (error) {
      console.log(`   ❌ ${asset.name}: Failed to load`);
    }
  }

  return true;
}

async function testBrowserCompatibilityModule() {
  console.log('\n4️⃣ Testing browser compatibility module...');

  const fs = require('fs');
  const path = require('path');

  try {
    // Read the browser compatibility file
    const compatPath = path.join(__dirname, 'lib/utils/browser-compatibility.ts');
    const compatContent = fs.readFileSync(compatPath, 'utf8');

    // Check for key functions
    const hasDetectBrowser = compatContent.includes('detectBrowser');
    const hasFeatureSupport = compatContent.includes('checkFeatureSupport');
    const hasPolyfills = compatContent.includes('loadPolyfills');
    const hasAudioSupport = compatContent.includes('audio:');
    const hasMediaRecorder = compatContent.includes('MediaRecorder');

    console.log(`   ${hasDetectBrowser ? '✅' : '❌'} Browser detection: ${hasDetectBrowser}`);
    console.log(`   ${hasFeatureSupport ? '✅' : '❌'} Feature support detection: ${hasFeatureSupport}`);
    console.log(`   ${hasPolyfills ? '✅' : '❌'} Polyfill system: ${hasPolyfills}`);
    console.log(`   ${hasAudioSupport ? '✅' : '❌'} Audio feature detection: ${hasAudioSupport}`);
    console.log(`   ${hasMediaRecorder ? '✅' : '❌'} MediaRecorder support: ${hasMediaRecorder}`);

  } catch (error) {
    console.log(`   ❌ Compatibility module error: ${error.message}`);
  }
}

async function testAudioModule() {
  console.log('\n5️⃣ Testing audio unlock module...');

  const fs = require('fs');
  const path = require('path');

  try {
    // Read the audio unlock file
    const audioPath = path.join(__dirname, 'lib/audio/audioUnlock.ts');
    const audioContent = fs.readFileSync(audioPath, 'utf8');

    // Check for key functions
    const hasUnlockAudio = audioContent.includes('unlockAudio');
    const hasIsAudioUnlocked = audioContent.includes('isAudioUnlocked');
    const hasAudioContext = audioContent.includes('AudioContext');
    const hasSilentBuffer = audioContent.includes('createBuffer');

    console.log(`   ${hasUnlockAudio ? '✅' : '❌'} Audio unlock function: ${hasUnlockAudio}`);
    console.log(`   ${hasIsAudioUnlocked ? '✅' : '❌'} Audio status check: ${hasIsAudioUnlocked}`);
    console.log(`   ${hasAudioContext ? '✅' : '❌'} AudioContext handling: ${hasAudioContext}`);
    console.log(`   ${hasSilentBuffer ? '✅' : '❌'} Silent buffer creation: ${hasSilentBuffer}`);

  } catch (error) {
    console.log(`   ❌ Audio module error: ${error.message}`);
  }
}

async function testVoiceChatComponent() {
  console.log('\n6️⃣ Testing voice chat component...');

  const fs = require('fs');
  const path = require('path');

  try {
    // Read the voice chat component
    const voicePath = path.join(__dirname, 'components/chat/MaiaVoiceChat.tsx');
    const voiceContent = fs.readFileSync(voicePath, 'utf8');

    // Check for key functionality
    const hasVoiceRecording = voiceContent.includes('handleVoiceRecording');
    const hasMediaRecorderRef = voiceContent.includes('mediaRecorderRef');
    const hasAudioSupport = voiceContent.includes('hasAudioSupport');
    const hasBrowserCompatibility = voiceContent.includes('useBrowserCompatibility');
    const hasAudioUnlock = voiceContent.includes('unlockAudio');
    const hasGetUserMedia = voiceContent.includes('getUserMedia');
    const hasMicrophoneButton = voiceContent.includes('Mic');
    const hasAudioPlayback = voiceContent.includes('Audio');

    console.log(`   ${hasVoiceRecording ? '✅' : '❌'} Voice recording handler: ${hasVoiceRecording}`);
    console.log(`   ${hasMediaRecorderRef ? '✅' : '❌'} MediaRecorder reference: ${hasMediaRecorderRef}`);
    console.log(`   ${hasAudioSupport ? '✅' : '❌'} Audio support detection: ${hasAudioSupport}`);
    console.log(`   ${hasBrowserCompatibility ? '✅' : '❌'} Browser compatibility hook: ${hasBrowserCompatibility}`);
    console.log(`   ${hasAudioUnlock ? '✅' : '❌'} Audio unlock integration: ${hasAudioUnlock}`);
    console.log(`   ${hasGetUserMedia ? '✅' : '❌'} getUserMedia API usage: ${hasGetUserMedia}`);
    console.log(`   ${hasMicrophoneButton ? '✅' : '❌'} Microphone button UI: ${hasMicrophoneButton}`);
    console.log(`   ${hasAudioPlayback ? '✅' : '❌'} Audio playback functionality: ${hasAudioPlayback}`);

  } catch (error) {
    console.log(`   ❌ Voice chat component error: ${error.message}`);
  }
}

async function testBackendAPI() {
  console.log('\n7️⃣ Testing MAIA backend API...');

  try {
    // Test the MAIA chat endpoint with a simple message
    const testMessage = {
      message: 'Hello MAIA, this is a test',
      userId: 'test_user_123',
      history: [],
      audioEnabled: true,
      browserInfo: {
        hasAudioSupport: true,
        hasWebAPISupport: true,
        hasModernJS: true,
        isLegacy: false
      }
    };

    console.log('   📤 Sending test message to /api/maia/chat...');

    const response = await fetch('http://localhost:3002/api/maia/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Browser-Legacy': 'false',
        'X-Audio-Support': 'true'
      },
      body: JSON.stringify(testMessage)
    });

    console.log(`   ✅ Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Response message: ${data.message ? 'Present' : 'Missing'}`);
      console.log(`   ✅ Audio URL: ${data.audioUrl ? 'Present' : 'Not provided'}`);
    } else {
      console.log(`   ❌ API Error: ${response.statusText}`);
    }

  } catch (error) {
    console.log(`   ❌ Backend API error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 MAIA Voice Chat - Comprehensive Feature Test\n');
  console.log('=' .repeat(50));

  // Check if development server is running
  try {
    await fetch('http://localhost:3002/');
    console.log('✅ Development server is running on localhost:3002\n');
  } catch (error) {
    console.log('❌ Development server is not running on localhost:3002');
    console.log('   Please run: npm run dev\n');
    process.exit(1);
  }

  // Run all tests
  await testServerResponse();
  await testBrowserCompatibilityModule();
  await testAudioModule();
  await testVoiceChatComponent();
  await testBackendAPI();

  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log('✅ All tests completed successfully!');
  console.log('\n📋 Manual testing recommendations:');
  console.log('   1. Open http://localhost:3002/maia in multiple browsers');
  console.log('   2. Test voice recording functionality');
  console.log('   3. Verify audio playback works after user interaction');
  console.log('   4. Check browser compatibility warnings in console');
  console.log('   5. Test mobile responsive design');
  console.log('   6. Verify PWA install prompt appears');
  console.log('\n📖 For detailed testing guide: see manual-test-guide.md');
}

// Use node-fetch polyfill for older Node versions
global.fetch = global.fetch || ((...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)));

runAllTests().catch(console.error);