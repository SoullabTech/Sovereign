import type { CapacitorConfig } from '@capacitor/cli';

// Build mode detection
// - CAPACITOR_BUILD=1 during npm run build triggers beta mode
// - CAPACITOR_MODE can override (dev/beta/prod)
const BUILD_MODE = (
  process.env.CAPACITOR_BUILD === '1'
    ? (process.env.CAPACITOR_MODE || 'beta')
    : (process.env.CAPACITOR_MODE || 'dev')
) as 'dev' | 'beta' | 'prod';

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
  webDir: isProdLike ? 'out' : '.next/static',

  // Beta/prod: use bundled assets (no server.url)
  // Dev: use live server for hot reload
  server: isProdLike
    ? { androidScheme: 'https' }
    : devServer,
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
      popup: true
    }
  }
};

export default config;
