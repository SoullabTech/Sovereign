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

  // IMPORTANT: iOS must use LOCAL assets (not remote URL) for native plugins to work
  // Using server.url breaks Capacitor.getPlatform() - returns 'web' instead of 'ios'
  // See: https://github.com/ionic-team/capacitor/issues/2373
  // Dev mode: use local dev server for hot reload
  server: BUILD_MODE === 'dev' ? devServer : undefined,

  // Enable WebView debugging in dev + beta builds — disabled only in prod
  // This allows Safari Web Inspector to attach for TestFlight debug sessions
  ios: {
    webContentsDebuggingEnabled: BUILD_MODE !== 'prod',
  },
  // Custom iOS plugins that need explicit registration
  // AudioSessionManager is our custom plugin for managing iOS audio session state
  // SignInWithApple + GoogleAuth are community plugins that also need explicit registration
  packageClassList: [
    'BluetoothLe',
    'SpeechRecognition',
    'AudioSessionManager',
    'VoiceController',
    'SignInWithApple',
    'GoogleAuth',
    'AppPlugin',
    'ClipboardPlugin',
    'FilesystemPlugin',
    'HapticsPlugin',
    'LocalNotificationsPlugin',
    'SharePlugin',
    'SplashScreenPlugin',
    'StatusBarPlugin',
    'VoiceRecorder'
  ],
  plugins: {
    // Enable native HTTP to bypass CORS in WKWebView
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 1600,
      backgroundColor: "#030814",
      showSpinner: false,
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
