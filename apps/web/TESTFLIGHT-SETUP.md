# 📱 TestFlight Setup Guide for MAIA Sovereign

Complete guide to distribute your MAIA Sovereign app via Apple's TestFlight beta testing platform.

## 🎯 **What is TestFlight?**
- Apple's official beta testing platform
- Share your app with up to 100 internal testers
- Up to 10,000 external testers (after app review)
- Testers install via TestFlight app from App Store
- Automatic updates when you release new versions

---

## 🚀 **Step 1: Prerequisites**

### Required Accounts & Tools:
✅ **Apple Developer Account** ($99/year)
- Sign up at: https://developer.apple.com/programs/
- Required for TestFlight and App Store

✅ **Xcode** (already installed and opening)
✅ **MAIA Sovereign app** (already built)

---

## 📝 **Step 2: App Store Connect Setup**

### 1. Create App in App Store Connect
Go to: https://appstoreconnect.apple.com

1. **Login** with Apple Developer credentials
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill out app information:
   ```
   Platform: iOS
   Name: MAIA Sovereign
   Primary Language: English
   Bundle ID: com.soullab.maia (already configured)
   SKU: maia-sovereign-2024 (can be anything unique)
   ```

### 2. App Information
- **App Name**: MAIA Sovereign
- **Subtitle**: AI Voice Assistant
- **Category**: Productivity
- **Description**:
   ```
   MAIA Sovereign is an advanced AI voice assistant that provides
   intelligent conversation and assistance through natural voice
   interaction. Experience the future of AI communication.
   ```

### 3. Required Screenshots & Assets
We need to create these:
- App Store screenshots (various iPhone sizes)
- App Store icon (1024×1024)
- Privacy Policy URL (optional for beta)

---

## 🔧 **Step 3: Prepare App for Upload**

### 1. Update Version & Build Number
In Xcode (when it opens):
1. Select your project in navigator
2. Go to **"General"** tab
3. Update:
   ```
   Version: 1.0.0
   Build: 1
   ```

### 2. Configure Signing & Capabilities
1. In Xcode → **"Signing & Capabilities"**
2. Select **"Automatically manage signing"**
3. Choose your **Apple Developer Team**
4. Ensure Bundle Identifier is: `com.soullab.maia`

### 3. Archive the App
1. In Xcode, select **"Any iOS Device"** (not Simulator)
2. Menu: **Product** → **Archive**
3. Wait for archive to complete (2-5 minutes)
4. **Organizer** window will open automatically

---

## 📤 **Step 4: Upload to App Store Connect**

### In Xcode Organizer:
1. Select your **MAIA Sovereign** archive
2. Click **"Distribute App"**
3. Choose **"App Store Connect"**
4. Select **"Upload"**
5. Choose your **Distribution Certificate**
6. Review and click **"Upload"**

### Upload Process:
- Takes 5-15 minutes depending on connection
- You'll get confirmation when complete
- App will appear in App Store Connect within 10-20 minutes

---

## ✅ **Step 5: Enable TestFlight**

### In App Store Connect:
1. Go to your **MAIA Sovereign** app
2. Click **"TestFlight"** tab
3. Your uploaded build will appear under **"iOS"**
4. Wait for **"Processing"** to complete (10-30 minutes)
5. Status will change to **"Ready to Submit"** → **"Testing"**

### Add Test Information:
1. Click on your build number
2. Add **"Beta App Review Information"**:
   ```
   Demo Account: [if needed]
   Test Notes:
   "MAIA Sovereign is an AI voice assistant.
   To test voice features, allow microphone access when prompted.
   The app provides natural language conversation through voice."
   ```

---

## 👥 **Step 6: Add Beta Testers**

### Internal Testers (Immediate Access):
1. **TestFlight** → **"Internal Testing"**
2. Click **"+"** next to testers
3. Add email addresses of people with App Store Connect access
4. Select your build
5. Click **"Start Testing"**

### External Testers (Most Common):
1. **TestFlight** → **"External Testing"**
2. Click **"+"** to create new group
3. Name it: "MAIA Beta Testers"
4. Add email addresses (up to 100 initially)
5. Select your build
6. Submit for **Beta App Review** (1-3 days)

---

## 📲 **Step 7: Share with Testers**

### Send Instructions to Testers:
```
Hi! You're invited to beta test MAIA Sovereign!

1. Install TestFlight from App Store:
   https://apps.apple.com/app/testflight/id899247664

2. Check your email for TestFlight invitation

3. Tap "Accept" in the email invitation

4. MAIA Sovereign will appear in your TestFlight app

5. Tap "Install" to download and test

6. Allow microphone access for voice features

Questions? Reply to this email!
```

---

## 🔄 **Step 8: Update Workflow**

### When you make changes to your app:

1. **In your terminal** (our project):
   ```bash
   cd /Users/soullab/MAIA-SOVEREIGN/apps/web
   npm run build
   npx cap sync
   ```

2. **In Xcode**:
   - Increment Build number (1 → 2 → 3, etc.)
   - Product → Archive
   - Distribute → Upload to App Store Connect

3. **In App Store Connect**:
   - New build appears in TestFlight
   - Testers get automatic update notification
   - They can update via TestFlight app

---

## 📊 **Step 9: Monitor Testing**

### TestFlight Analytics:
- View install/crash data
- See tester feedback
- Monitor app performance
- Track feature usage

### Tester Feedback:
- Testers can send feedback through TestFlight
- Screenshots of issues automatically included
- Crash reports automatically collected

---

## 🎉 **What Happens Next**

### Immediate (Today):
1. Xcode opens with your iOS project
2. You can test in iOS Simulator immediately
3. Archive and upload to TestFlight

### Within 24 hours:
1. TestFlight build ready for internal testers
2. External testers (after Beta App Review)
3. Start collecting feedback

### Ongoing:
1. Iterate based on feedback
2. Push updates via same workflow
3. Scale to more testers
4. Eventually submit to App Store

---

## 🆘 **Troubleshooting**

### Common Issues:

**1. Archive fails:**
- Ensure "Any iOS Device" is selected (not Simulator)
- Check signing certificates
- Clean build folder: Product → Clean Build Folder

**2. Upload fails:**
- Check bundle identifier matches App Store Connect
- Ensure version/build number is incremented
- Verify Apple Developer membership is active

**3. TestFlight processing stuck:**
- Wait 30 minutes (Apple's processing time)
- Check for email from Apple about issues
- Ensure app follows App Store guidelines

**4. Testers can't install:**
- Verify their email is correct in TestFlight
- Check they have iOS 12+ (our minimum)
- Ensure they installed TestFlight app first

---

## 🎯 **Success Metrics**

### Track These KPIs:
- **Install Rate**: % of invited testers who install
- **Usage Time**: How long testers use the app
- **Crash Rate**: Should be <1%
- **Feedback Quality**: Feature requests and bug reports
- **Voice Feature Adoption**: % who use voice chat

---

## 📞 **Next Steps After TestFlight**

### 1. Collect Feedback (1-2 weeks)
### 2. Iterate and Improve
### 3. Submit to App Store
### 4. Public Launch 🚀

---

## ✨ **You're Ready!**

Your MAIA Sovereign app is now ready for professional beta testing through TestFlight. This is the same process used by major companies for app distribution.

**Time to TestFlight**: ~2-4 hours for first upload
**Time to Testers**: ~24-48 hours including review

Let's get your app in the hands of real users! 🎉