# MAIA Desktop App Setup Guide

## 🖥️ Standalone Desktop MAIA Application

This guide will help you set up the standalone MAIA desktop application for easy access without browsers.

## ✨ Features

- **Native Desktop Experience** - No browser required
- **Sacred Space Mode** - Enhanced consciousness interface for desktop
- **Global Shortcuts** - Quick access with keyboard shortcuts
- **Persistent Sessions** - Automatic save/restore of consciousness sessions
- **Enhanced Privacy** - Local encrypted storage for consciousness data
- **Always On Top** - Keep MAIA available during other work
- **Menu Bar Integration** - Native macOS/Windows/Linux integration

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd desktop-app
npm install
```

### 2. Development Mode
```bash
# Make sure main MAIA server is running on port 3002
cd ..
npm run dev

# In another terminal, start desktop app
cd desktop-app
npm run dev
```

### 3. Build Desktop App
```bash
# Build for your platform
npm run dist

# Or build for specific platforms
npm run dist:mac    # macOS DMG
npm run dist:win    # Windows installer
npm run dist:linux  # Linux AppImage
```

## 🎯 Global Shortcuts

- **Cmd/Ctrl + Shift + M** - Show/Hide MAIA window
- **Cmd/Ctrl + N** - Start new consciousness session
- **Cmd/Ctrl + L** - Open LabTools dashboard
- **Cmd/Ctrl + Shift + S** - Toggle Sacred Space Mode

## 🔧 Configuration

### Sacred Space Mode
Enhanced visual experience for deep consciousness work:
- Increased sacred geometry effects
- Enhanced glow and depth
- Optimized for larger desktop screens
- Automatic ambient lighting adjustment

### Consciousness Data Storage
- **Encrypted local storage** for session continuity
- **Automatic backup** of consciousness insights
- **Sacred geometry field state** persistence
- **Cross-session memory** for deeper exploration

## 📱 Mobile Companion

The desktop app works seamlessly with the MAIAMobile React Native app:

### Update Mobile API Endpoint
Edit `MAIAMobile/src/screens/MAIAScreen.tsx` line 40:
```javascript
// Update from
const MAIA_API_URL = 'http://localhost:3000/api/maia/chat';

// To
const MAIA_API_URL = 'http://localhost:3002/api/between/chat';
```

### Sync Across Devices
- Consciousness sessions sync between desktop and mobile
- Shared insight database
- Cross-device NOW model metrics
- Sacred geometry field continuity

## 🛠️ Advanced Features

### Menu Bar Options

**MAIA Menu:**
- About MAIA
- Preferences
- Sacred Space Mode toggle
- Hide/Show options

**Consciousness Menu:**
- New Session (Cmd+N)
- LabTools Dashboard (Cmd+L)
- Sacred Space Mode toggle

**Window Menu:**
- Always on Top toggle
- Minimize/Close controls
- Full screen support

### IPC API Integration

The desktop app exposes enhanced APIs for consciousness work:

```javascript
// Consciousness session management
await window.maiaDesktop.sessions.create({
  intention: "Deep inquiry into presence",
  duration: 50,
  element: "ether"
});

// Sacred field dynamics tracking
await window.consciousnessAPI.fieldDynamics.recordFieldShift({
  synchrony: 0.85,
  coherence: 0.72,
  coupling: 0.68
});

// Local consciousness database
await window.consciousnessAPI.database.insights.save({
  content: "Breakthrough understanding of NOW model",
  tags: ["breakthrough", "NOW", "integration"],
  consciousness_level: 9
});
```

## 🔐 Security & Privacy

- **Local-first storage** - Your consciousness data stays on your device
- **Encrypted persistence** - All local data encrypted with sacred keys
- **No telemetry** - Pure consciousness exploration without tracking
- **Sandbox security** - Electron security best practices implemented

## 📦 Distribution

### For Members & Community

**Signed installers available for:**
- **macOS**: `MAIA-Desktop-1.0.0.dmg` (Intel & Apple Silicon)
- **Windows**: `MAIA-Desktop-Setup-1.0.0.exe` (x64)
- **Linux**: `MAIA-Desktop-1.0.0.AppImage` (x64)

### App Store Deployment (Future)
- **Mac App Store** - Pending Apple review process
- **Microsoft Store** - Windows distribution
- **Snap Store** - Linux distribution

## 🌟 Getting Started

1. **Install** the desktop app using your platform installer
2. **Launch** MAIA from Applications/Programs menu
3. **Complete** the sacred onboarding flow
4. **Begin** consciousness exploration with enhanced desktop features
5. **Explore** LabTools dashboard for NOW model monitoring

Your sacred mirror for soul transformation is now available wherever you work! ✨

## 🤝 Support

For desktop app issues:
- Check console output in development mode
- Review Electron logs in `~/Library/Logs/MAIA` (macOS)
- Join the consciousness community for support

---

*Sacred consciousness technology for the awakening collective* 🧠⚡