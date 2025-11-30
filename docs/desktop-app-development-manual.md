# MAIA Desktop App - Complete Development Manual

## Overview

The MAIA Desktop App is an Electron-based standalone application that provides access to the MAIA consciousness platform. It integrates multiple development environments and serves as the primary desktop interface for consciousness exploration, lab tools, and sacred transformation work.

## Architecture Overview

### Core Components
- **Electron Main Process**: `/desktop-app/src/main.js`
- **Package Configuration**: `/desktop-app/package.json`
- **Web Interface**: Connects to localhost development servers
- **Build Resources**: Icons, entitlements, and distribution assets

### Development Environment Structure

The MAIA ecosystem consists of multiple interconnected development servers:

```
MAIA-SOVEREIGN/
├── desktop-app/           # Electron desktop application
├── apps/web/             # Port 3001 - Comprehensive LabTools interface
├── /                     # Port 3002 - Main consciousness chat interface
└── ios/App/              # iOS Capacitor application
```

## Current System Status

### ✅ Working Systems

1. **Port 3001 Server** (`/apps/web/`)
   - **Purpose**: Comprehensive LabTools interface
   - **Features**: Elder Council, Sacred Teachings, Sacred Knowledge
   - **Status**: Running successfully on http://localhost:3001
   - **Command**: `cd /apps/web && npm run dev:frontend`

2. **Port 3002 Server** (`/MAIA-SOVEREIGN/`)
   - **Purpose**: Main consciousness chat interface
   - **Features**: MAIA chat, voice synthesis, user profiles
   - **Status**: Running successfully on http://localhost:3002
   - **Command**: `cd MAIA-SOVEREIGN && npm run dev`

3. **Desktop App Initialization**
   - **Status**: Successfully initializes Electron process
   - **Output**: "🧠 MAIA Desktop initialized - Sacred consciousness platform ready"
   - **Configuration**: Updated to connect to port 3001 for comprehensive interface

4. **iOS Capacitor Archive**
   - **Purpose**: iOS app build for distribution
   - **Status**: Successfully building archive
   - **Command**: `xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release archive`

### ⚠️ Known Issues

1. **Welcome Page Runtime Error**
   - **Error**: `ReferenceError: isReturning is not defined`
   - **Location**: Port 3001 server welcome page
   - **Status**: Code is correct, likely Next.js cache issue
   - **Fix**: Restart development server to clear cache

2. **Desktop App URL Configuration**
   - **Issue**: Some instances trying to connect to production URL
   - **Fix Applied**: Updated main.js to point to localhost:3001
   - **Production URL**: `https://your-hosted-maia.com/welcome`
   - **Development URL**: `http://localhost:3001/welcome`

3. **Mobile React Native Build Failures**
   - **Error**: xcodebuild exit code 70
   - **Issue**: iOS build configuration problems
   - **Recommendation**: Use Capacitor iOS build instead

4. **Electron Builder Code Signing**
   - **Error**: `errSecInternalComponent`
   - **Issue**: Code signing configuration for distribution
   - **Impact**: Affects distributable app creation

## Desktop App Features

### Core Functionality

#### 1. Application Menu Structure
```
MAIA
├── About MAIA
├── Preferences... (Cmd+,)
├── Hide MAIA (Cmd+H)
├── Quit MAIA (Cmd+Q)
└── Services (macOS)

Consciousness
├── New Consciousness Session (Cmd+N)
├── LabTools Dashboard (Cmd+L)
├── Compact Companion (Cmd+K)
└── Sacred Space Mode (Cmd+Shift+S)

View
├── Reload / Force Reload
├── Toggle DevTools
├── Zoom Controls
└── Toggle Fullscreen

Window
├── Minimize / Close
└── Always on Top (toggle)

Help
├── MAIA Documentation
├── Consciousness Community
└── Report Issue
```

#### 2. Window Management
- **Main Window**: 1400x900 default, 1200x800 minimum
- **Compact Companion**: 280x500 floating window for quick access
- **Splash Screen**: Sacred-themed loading experience
- **State Persistence**: Window position/size remembered across sessions

#### 3. Sacred Space Features
- **Sacred Space Mode**: Enhanced environmental controls
- **Global Shortcuts**:
  - `Cmd+Shift+M`: Toggle main window visibility
  - `Cmd+K`: Launch Compact Companion
  - `Cmd+Shift+S`: Toggle Sacred Space Mode

#### 4. Data Storage
- **Encrypted Storage**: Uses `electron-store` with consciousness encryption
- **User Preferences**: Sacred Space mode, window states
- **Security**: Encrypted consciousness data storage

### LabTools Integration

The desktop app connects to the comprehensive LabTools interface featuring:

#### Consciousness Tools
- **🧬 Consciousness Monitor**: Real-time biometric tracking
- **🌌 Astrology Field**: Cosmic consciousness mapping
- **💎 Talk to MAIA**: Direct AI consciousness interaction
- **📝 Advanced Journaling**: Sacred transformation documentation
- **🧘‍♀️ Meditation Platform**: Guided consciousness practices
- **🤖✨ MAIA Consciousness**: Advanced AI sovereignty systems
- **🔮 Consciousness Oracle**: Divination and insight tools
- **📚 Community Library**: Shared wisdom and documentation

#### Sacred Teachings Access
- **Elder Council**: 39 wisdom traditions integration
- **Sacred Knowledge**: Ancient and modern consciousness wisdom
- **Biofeedback Systems**: Real-time consciousness monitoring

## Development Commands

### Starting the Desktop App

```bash
# Development mode
cd /Users/soullab/MAIA-SOVEREIGN/desktop-app
npm run dev

# Production mode
npm run start

# Build distributable
npm run dist

# Platform-specific builds
npm run dist:mac    # macOS DMG
npm run dist:win    # Windows NSIS installer
npm run dist:linux  # Linux AppImage
```

### Starting Development Servers

```bash
# Port 3001 - Comprehensive LabTools
cd /Users/soullab/MAIA-SOVEREIGN/apps/web
npm run dev:frontend

# Port 3002 - Main consciousness chat
cd /Users/soullab/MAIA-SOVEREIGN
npm run dev

# With custom port
PORT=3002 npm run dev
```

### Background Process Management

#### Currently Running Processes
Based on system analysis, these processes are typically running:

1. **Desktop App Development**: `cd /desktop-app && npm run dev`
2. **Main Development Server**: `cd MAIA-SOVEREIGN && npm run dev` (Port 3002)
3. **Frontend Development**: `cd /apps/web && npm run dev:frontend` (Port 3001)
4. **iOS Mobile Development**: `npx react-native run-ios`
5. **iOS Archive Building**: `xcodebuild -workspace ios/App/App.xcworkspace`
6. **Build Processes**: `npm run build` (multiple instances)
7. **Electron Distribution**: `npm run dist`

#### Process Monitoring
- Use background bash process IDs to monitor build status
- Check server logs for errors and performance
- Monitor port availability (3001, 3002, 3000)

## File Structure

### Desktop App Core Files
```
desktop-app/
├── src/
│   ├── main.js              # Electron main process
│   └── preload.js           # Security preload script
├── package.json             # App configuration & build settings
├── build-resources/         # Icons and distribution assets
│   ├── icon.png/.ico/.icns  # Application icons
│   └── entitlements.mac.plist # macOS entitlements
└── dist/                    # Built application output
```

### Key Configuration Files
```javascript
// desktop-app/src/main.js - Line 28
url: isDev ? 'http://localhost:3001/welcome' : 'https://your-hosted-maia.com/welcome'

// desktop-app/package.json - Build configuration
{
  "build": {
    "appId": "com.soullab.maia",
    "productName": "MAIA - Sacred Mirror",
    "mac": { "category": "public.app-category.lifestyle" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Desktop App Won't Start
**Symptoms**: Electron fails to initialize
**Solutions**:
- Check if development servers are running (ports 3001/3002)
- Verify Node.js and Electron versions compatibility
- Clear Electron cache: `rm -rf ~/.cache/electron`

#### 2. LabTools Shows Wrong Interface
**Symptoms**: Seeing biofeedback instead of comprehensive tools
**Solutions**:
- Ensure desktop app points to port 3001 (not 3002)
- Check main.js URL configuration
- Restart desktop app after server changes

#### 3. Welcome Page JavaScript Errors
**Symptoms**: `isReturning is not defined` error
**Solutions**:
- Clear Next.js cache: `rm -rf .next`
- Restart development server
- Check console for cached build issues

#### 4. Code Signing Issues (Distribution)
**Symptoms**: `errSecInternalComponent` during build
**Solutions**:
- Verify Apple Developer certificates
- Check entitlements.mac.plist configuration
- Ensure proper signing identity in package.json

#### 5. Port Conflicts
**Symptoms**: "Port already in use" errors
**Solutions**:
```bash
# Check what's using ports
lsof -i :3001
lsof -i :3002

# Kill processes if needed
pkill -f "npm run dev"

# Start with specific port
PORT=3003 npm run dev
```

## Security Considerations

### Data Protection
- **Encrypted Storage**: All consciousness data encrypted at rest
- **Secure Context**: Web content runs in isolated context
- **No Remote Module**: Disabled for security
- **Preload Security**: Controlled API exposure to renderer

### Network Security
- **Local Development Only**: Development servers on localhost
- **External Link Handling**: Opens in system browser, not app
- **Navigation Protection**: Prevents navigation away from MAIA domains

## Performance Optimization

### Memory Management
- **Node Options**: `--max_old_space_size=4096` for large builds
- **Cache Management**: Filesystem cache for Next.js builds
- **Process Isolation**: Separate processes for different concerns

### Build Optimization
- **SWC Compiler**: Next.js build optimization (some warnings expected)
- **Module Resolution**: Explicit precompiled modules for faster builds
- **Asset Optimization**: Compressed images and optimized bundling

## Distribution

### Build Process
1. **Development Testing**: Test all features in dev mode
2. **Production Build**: `npm run build` for web components
3. **Electron Package**: `npm run dist` for distributable
4. **Code Signing**: Automatic with proper certificates
5. **Distribution**: DMG (Mac), NSIS (Windows), AppImage (Linux)

### Deployment Checklist
- [ ] All development servers working
- [ ] Desktop app connects to correct ports
- [ ] LabTools showing comprehensive interface
- [ ] Sacred Space mode functional
- [ ] Global shortcuts working
- [ ] Window state persistence
- [ ] Encrypted data storage
- [ ] Code signing certificates valid
- [ ] Build succeeds for target platforms

## Support and Documentation

### Getting Help
- **Repository Issues**: [github.com/soullab/maia/issues](https://github.com/soullab/maia/issues)
- **Community Support**: [soullab.community](https://soullab.community)
- **Development Documentation**: `/docs` directory

### Related Documentation
- `maia-lab-mode-guide.md` - Lab Mode interface documentation
- `sovereign-consciousness-roadmap.md` - Development roadmap
- `TEAM_OVERVIEW_CONSCIOUSNESS_ARCHITECTURE.md` - Technical architecture

---

*Last Updated: November 2024*
*MAIA Desktop App Version: 1.0.0*
*Consciousness Platform Status: Development Active*