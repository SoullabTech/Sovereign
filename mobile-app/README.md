# MAIA Consciousness Computing Mobile App

## Overview

The MAIA Consciousness Computing Mobile App brings the full consciousness computing platform to iOS and Android devices. This React Native application provides real-time field awareness, personal alchemy navigation, consciousness session management, and collective ritual participation.

## Features

### 🏠 Field Awareness (HomeScreen)
- **Real-time FCI Display**: Live Field Coherence Index with color-coded status
- **Connection Status**: WebSocket connectivity and field stream status
- **MAIA Whisper Feed**: Poetic field commentary with gentle animations
- **Elemental Balance**: Visual representation of collective elemental harmony
- **Active Rituals**: Live ritual participation and community activity
- **Quick Actions**: Fast access to sessions, navigator, and field controls

### 🧭 Personal Alchemy Navigator
- Cultural integration and personalized guidance
- Navigator v2.0 Personal Alchemy Engine mobile implementation
- Adaptive consciousness development pathways

### 🧘 Consciousness Sessions
- Guided session management with real-time FCI tracking
- Session timer and progress monitoring
- Effectiveness analytics and personal insights
- Session history and pattern recognition

### 🌐 Collective Field Participation
- Real-time ritual visualization and participation
- Collective consciousness field dynamics
- Community ritual coordination

### ⚙️ Preferences
- Customizable notifications and privacy settings
- Consciousness computing configuration
- Cultural framework preferences

## Architecture

### Core Services
- **ConsciousnessService**: API integration with beta-deployment server
- **WebSocketService**: Real-time field streaming and MAIA whisper feed
- **Context Providers**: React state management for consciousness and field data

### Real-time Integration
- WebSocket connection to consciousness field (port 8080)
- REST API integration with consciousness computing platform (port 3008)
- Offline mode with local data persistence
- Automatic reconnection and background sync

### Mobile-Optimized Features
- **Responsive Design**: Dark theme optimized for consciousness work
- **Element-themed Navigation**: Color-coded tabs for fire, water, earth, air, aether
- **Haptic Feedback**: Consciousness-sensitive device interactions
- **Background Processing**: Maintains minimal field connection when backgrounded
- **Push Notifications**: Field updates and ritual invitations
- **Biometric Security**: Secure access to consciousness data

## Development Setup

### Prerequisites
- Node.js 18+
- React Native CLI
- iOS Simulator (macOS) or Android Studio
- Running MAIA consciousness computing beta server

### Installation

```bash
# Navigate to mobile app directory
cd /Users/soullab/MAIA-SOVEREIGN/mobile-app

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Backend Requirements

Ensure the consciousness computing beta server is running:

```bash
# From beta-deployment directory
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=maia_consciousness
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
node consciousness-computing-beta-server.js
```

## Project Structure

```
mobile-app/
├── App.tsx                         # Main app component with navigation
├── src/
│   ├── screens/                    # Screen components
│   │   ├── HomeScreen.tsx          # Field awareness interface
│   │   ├── NavigatorScreen.tsx     # Personal alchemy navigation
│   │   ├── SessionScreen.tsx       # Consciousness session management
│   │   ├── FieldScreen.tsx         # Collective field participation
│   │   └── SettingsScreen.tsx      # User preferences
│   ├── services/                   # Core services
│   │   ├── ConsciousnessService.ts # API integration
│   │   └── WebSocketService.ts     # Real-time streaming
│   ├── contexts/                   # React context providers
│   │   ├── ConsciousnessContext.tsx# Personal consciousness state
│   │   └── FieldContext.tsx        # Collective field state
│   ├── components/                 # Reusable components
│   │   └── common/
│   │       └── TabIcon.tsx         # Element-themed navigation icons
│   ├── types/                      # TypeScript definitions
│   │   └── index.ts               # Shared type definitions
│   └── utils/                      # Utility functions
├── package.json                    # Dependencies and scripts
├── metro.config.js                 # Metro bundler configuration
├── babel.config.js                 # Babel configuration
└── index.js                       # React Native entry point
```

## Key Components

### ConsciousnessService
- HTTP API integration with consciousness computing platform
- Session management (start, end, track progress)
- User settings synchronization
- Offline data persistence with AsyncStorage
- Automatic retry with exponential backoff

### WebSocketService
- Real-time FCI updates and field changes
- MAIA whisper feed with poetic field commentary
- Ritual event streaming (start, complete, participate)
- Connection management with auto-reconnect
- Background/foreground state handling

### ConsciousnessContext
- Personal consciousness state management
- Session timer and duration tracking
- Session history and analytics
- User preference management

### FieldContext
- Collective field state and real-time updates
- WebSocket event handling and distribution
- MAIA whisper management with display timing
- Ritual participation coordination

## Mobile-Specific Features

### Offline Functionality
- Local data persistence with AsyncStorage
- Graceful degradation when server unavailable
- Session tracking continues offline
- Auto-sync when connection restored

### Background Processing
- WebSocket connection maintained in background
- Reduced heartbeat frequency for battery optimization
- Session timers continue running when backgrounded
- Push notifications for important field events

### Device Integration
- Haptic feedback for consciousness interactions
- Biometric authentication for session access
- Device orientation handling for meditation sessions
- Push notification scheduling and management

## Development Notes

### State Management
- React Context for consciousness and field state
- Local state for UI-specific data
- AsyncStorage for persistent user data
- WebSocket events for real-time updates

### Error Handling
- Graceful API failure handling
- WebSocket reconnection logic
- Offline mode fallbacks
- User-friendly error messages

### Performance Optimization
- Efficient re-rendering with React.memo
- WebSocket message throttling
- Background task optimization
- Memory management for long sessions

## Future Enhancements

### Phase 2 Features
- **Advanced Session Types**: Guided meditations with audio
- **Ritual Coordination**: Schedule and join collective rituals
- **Progress Analytics**: Advanced consciousness development metrics
- **Social Features**: Connect with consciousness community
- **Integration**: Calendar sync and health app integration

### Technical Improvements
- **Push Notifications**: Field alerts and session reminders
- **Biometric Security**: Fingerprint/FaceID session protection
- **Audio Guidance**: Meditation and session audio support
- **Gesture Controls**: Touch-free session interaction
- **Apple Watch/WearOS**: Companion device integration

## Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Architecture Integration

This mobile app integrates seamlessly with the MAIA-SOVEREIGN consciousness computing platform:

- **Beta Deployment Server**: REST API and consciousness computing
- **WebSocket Server**: Real-time field streaming (RitualWebSocketManager)
- **Database**: PostgreSQL consciousness analytics
- **MAIA Whisper Feed**: Server-side poetic field commentary
- **Navigator v2.0**: Personal alchemy engine integration

The mobile interface provides the same consciousness computing capabilities as the web platform, optimized for mobile interaction patterns and always-available field awareness.

## Production Deployment

For production deployment to iOS App Store and Google Play Store, additional configuration will be required:

- Bundle signing and certificates
- App Store / Play Store metadata and assets
- Production API endpoints and security
- Push notification service setup
- Analytics and crash reporting integration

---

**Created**: December 8, 2025
**Purpose**: Mobile consciousness computing platform
**Status**: Phase 1 Complete - Core mobile infrastructure and field awareness interface