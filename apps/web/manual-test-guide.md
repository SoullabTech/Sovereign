# MAIA Voice Chat - Browser Compatibility Test Guide

## 🎯 Quick Test Checklist

### 1. Open MAIA Interface
Navigate to: `http://localhost:3002/maia`

### 2. Basic Loading Tests
- [ ] Page loads without 404 errors
- [ ] MAIA greeting component appears
- [ ] Chat interface is fully visible
- [ ] No JavaScript console errors

### 3. Browser Compatibility Detection
Open Developer Console (F12) and check for:
- [ ] "🔧 Browser Compatibility" console group appears
- [ ] Browser name and version detected correctly
- [ ] Support level shows (full/partial/minimal/none)
- [ ] Any compatibility warnings listed

### 4. Voice/Audio Feature Tests

#### Audio Unlock Test
- [ ] Click anywhere on the page to trigger audio unlock
- [ ] Check console for "Audio initialization" messages
- [ ] Look for audio context creation success/failure

#### Voice Recording Button
- [ ] Locate the microphone (🎤) button in the chat input area
- [ ] Button should be enabled (not grayed out)
- [ ] Hover shows tooltip "Start voice recording"
- [ ] Click should request microphone permission

#### Audio Playback Features
- [ ] Audio toggle button (🔊/🔇) is present
- [ ] Button is functional (can toggle on/off)
- [ ] Audio controls appear for any voice responses

### 5. Mobile/Responsive Tests
- [ ] Resize browser window to mobile width (< 768px)
- [ ] Mobile chat view should activate
- [ ] Touch interactions work on mobile devices
- [ ] Voice features still available on mobile

### 6. PWA Features Test
- [ ] Web App Manifest is loaded (`/manifest.json`)
- [ ] Install prompt appears (Chrome/Edge)
- [ ] Service Worker registers (check Application tab)
- [ ] Offline functionality available

### 7. Cross-Browser Testing

#### Chrome (Latest)
```
User Agent: Chrome/120.0.0.0
Expected: Full compatibility, all features working
```

#### Firefox (Latest)
```
User Agent: Firefox/119.0
Expected: Full compatibility, all features working
```

#### Safari (Latest)
```
User Agent: Safari/17.0
Expected: Full compatibility with iOS audio fixes
```

#### Edge (Latest)
```
User Agent: Edge/120.0.0.0
Expected: Full compatibility, all features working
```

#### Legacy Browser Test
```
User Agent: Chrome/85.0 (or older)
Expected: Compatibility warnings, some features degraded
```

## 🔍 Manual Testing Commands

### Check Browser Compatibility in Console:
```javascript
// Test browser detection
if (window.detectBrowser) {
  const browser = window.detectBrowser();
  console.log('Browser:', browser);
} else {
  console.log('Browser detection not loaded');
}

// Test feature support
if (window.checkFeatureSupport) {
  const features = window.checkFeatureSupport();
  console.log('Features:', features);
} else {
  console.log('Feature detection not loaded');
}
```

### Test Audio Unlock:
```javascript
// Test audio unlock manually
if (window.unlockAudio) {
  window.unlockAudio().then(() => {
    console.log('Audio unlocked:', window.isAudioUnlocked());
  }).catch(err => {
    console.error('Audio unlock failed:', err);
  });
}
```

### Test Voice API Support:
```javascript
// Check MediaRecorder API
console.log('MediaRecorder:', typeof MediaRecorder !== 'undefined');

// Check getUserMedia
console.log('getUserMedia:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

// Check AudioContext
console.log('AudioContext:', !!(window.AudioContext || window.webkitAudioContext));
```

## 📊 Expected Results by Browser

| Feature | Chrome | Firefox | Safari | Edge | Legacy |
|---------|--------|---------|--------|------|--------|
| Browser Detection | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Audio Unlock | ✅ | ✅ | ✅* | ✅ | ❌ |
| MediaRecorder | ✅ | ✅ | ✅* | ✅ | ❌ |
| getUserMedia | ✅ | ✅ | ✅* | ✅ | ❌ |
| PWA Features | ✅ | ⚠️ | ✅ | ✅ | ❌ |
| Voice Chat | ✅ | ✅ | ✅* | ✅ | ❌ |

*Safari requires user interaction for audio features

## 🚨 Common Issues & Solutions

### Issue: "Voice recording not supported"
**Solution:** Check microphone permissions in browser settings

### Issue: Audio doesn't play automatically
**Solution:** Click anywhere to unlock audio context (browser security)

### Issue: Module resolution errors
**Solution:** Clear `.next` cache and restart dev server

### Issue: 404 on /maia route
**Solution:** Verify file permissions and component imports

### Issue: Legacy browser warnings
**Solution:** Expected behavior - polyfills should load automatically

## ✅ Success Criteria

**All tests pass when:**
1. MAIA interface loads in all modern browsers
2. Voice recording button is functional
3. Audio playback works after user interaction
4. Browser compatibility warnings appear only for legacy browsers
5. PWA features are available in supported browsers
6. Mobile responsive design works correctly
7. No critical JavaScript errors in console

## 📝 Test Results Template

```
Browser: ____________
Version: ____________
OS: ____________

✅❌ Page Loading: ____
✅❌ Browser Detection: ____
✅❌ Audio Unlock: ____
✅❌ Voice Recording: ____
✅❌ Audio Playback: ____
✅❌ Mobile View: ____
✅❌ PWA Features: ____

Notes: _______________
```