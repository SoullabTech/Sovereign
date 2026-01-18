import type { CapacitorConfig } from '@capacitor/cli';

// Build mode detection
// - CAPACITOR_MODE=dev for local dev server (must be explicit)
// - Default to beta/prod (soullab.life) for TestFlight builds
const BUILD_MODE = (process.env.CAPACITOR_MODE || 'beta') as 'dev' | 'beta' | 'prod';

const isProdLike = BUILD_MODE === 'beta' || BUILD_MODE === 'prod';

// Dev server config (only used in dev mode)
const devServer = {
  url: 'http://192.168.4.210:3000',
  cleartext: true,
  androidScheme: 'http' as const,
};

const config: CapacitorConfig = {
  appId: 'life.soullab.maia',
  appName: 'MAIA Consciousness Computing',
  webDir: 'out',

  // Beta/prod: load from soullab.life remote server
  // Dev: use local dev server for hot reload
  server: isProdLike
    ? { url: 'https://soullab.life', androidScheme: 'https' }
    : devServer,

  // Enable WebView debugging for Safari Web Inspector (even in TestFlight)
  ios: {
    webContentsDebuggingEnabled: true,
  },
  // Custom iOS plugins that need explicit registration
  // AudioSessionManager is our custom plugin for managing iOS audio session state
  packageClassList: [
    'BluetoothLe',
    'SpeechRecognition',
    'AudioSessionManager',
    'AppPlugin',
    'ClipboardPlugin',
    'FilesystemPlugin',
    'HapticsPlugin',
    'LocalNotificationsPlugin',
    'SharePlugin',
    'SplashScreenPlugin',
    'StatusBarPlugin',
    'CapacitorVoiceRecorder'
  ],
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#1A1513",
      showSpinner: true,
      spinnerColor: "#6366f1"
    },
    HealthKit: {
      readPermissions: ['HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN']
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Scanning for OpenBCI Ganglion...",
        connect: "Connect to EEG headset",
        connected: "EEG headset connected"
      }
    },
    LocalNotifications: {
      smallIcon: "ic_stat_ipp",
      iconColor: "#6366f1",
      sound: "clinical_reminder.wav"
    },
    Filesystem: {
      requestDirAccess: true
    },
    Share: {
      enabled: true
    },
    Clipboard: {
      enabled: true
    },
    SpeechRecognition: {
      language: 'en-US',
      maxResults: 5,
      prompt: 'Speak to MAIA',
      partialResults: true,
      popup: false
    }
  }
};

export default config;
