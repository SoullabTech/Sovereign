# 📱 MAIA Sovereign - PWA to Native App Migration

## Option 1: Capacitor (Recommended for PWAs)

Capacitor allows you to wrap your existing PWA into native iOS/Android apps while keeping your web codebase.

### Setup Capacitor

```bash
# Install Capacitor
cd apps/web
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Initialize Capacitor
npx cap init "MAIA Sovereign" "com.soullab.maia" --web-dir=".next"

# Add platforms
npx cap add android
npx cap add ios
```

### Capacitor Configuration

```typescript
// apps/web/capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soullab.maia',
  appName: 'MAIA Sovereign',
  webDir: '.next',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFD700",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#FFD700"
    }
  }
};

export default config;
```

### Build and Deploy

```bash
# Build your Next.js app
npm run build

# Copy web assets to native projects
npx cap copy

# Open in native IDEs
npx cap open android  # Opens Android Studio
npx cap open ios      # Opens Xcode

# Or build directly
npx cap build android
npx cap build ios
```

## Option 2: React Native (Complete Rewrite)

For maximum performance and native features, rewrite using React Native.

### Setup React Native

```bash
# Create new React Native project
cd apps/
npx react-native init MAIASovereignApp --template react-native-template-typescript

# Install navigation and core dependencies
cd MAIASovereignApp
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-voice/voice react-native-sound
npm install @react-native-async-storage/async-storage
```

### Core Components Migration

```typescript
// apps/MAIASovereignApp/src/components/VoiceChat.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';

export const VoiceChat: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechResults = (e) => setTranscript(e.value?.[0] || '');

    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  const startRecording = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recording:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.transcript}>{transcript}</Text>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.recording]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop' : 'Start'} Recording
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  transcript: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

## Option 3: Expo (React Native with easier setup)

```bash
# Create Expo project
npx create-expo-app MAIASovereignExpo --template typescript

cd MAIASovereignExpo

# Install dependencies
npx expo install expo-av expo-speech expo-notifications
npx expo install @react-navigation/native @react-navigation/stack
```

## Option 4: Tauri (Desktop Apps)

For desktop applications (Windows, macOS, Linux).

```bash
# Setup Tauri
cd apps/web
npm install --save-dev @tauri-apps/cli
npm install @tauri-apps/api

# Initialize Tauri
npx tauri init

# Build desktop app
npx tauri build
```

## Option 5: Electron (Desktop Apps)

```bash
# Setup Electron
cd apps/web
npm install --save-dev electron electron-builder

# Create main process
# apps/web/electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);
```