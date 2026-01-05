import type { CapacitorConfig } from '@capacitor/cli';

// Detect if this is a production/beta build (not local dev)
// CAPACITOR_BUILD=1 is set during `npm run build` for Capacitor
// CAPACITOR_MODE can override explicitly
const isProductionBuild =
  process.env.CAPACITOR_BUILD === '1' ||
  process.env.CAPACITOR_MODE === 'beta' ||
  process.env.CAPACITOR_MODE === 'prod';

const BUILD_MODE = isProductionBuild
  ? (process.env.CAPACITOR_MODE || 'beta')
  : 'dev';

const serverConfigs = {
  dev: {
    // Local development - use LAN IP for physical device testing
    url: 'http://192.168.4.210:3000',
    cleartext: true,
  },
  beta: {
    // Beta/TestFlight - points to production backend
    url: 'https://soullab.life',
    cleartext: false,
  },
  prod: {
    // Production release - points to production backend
    url: 'https://soullab.life',
    cleartext: false,
  }
};

const config: CapacitorConfig = {
  appId: 'life.soullab.maia',
  appName: 'MAIA Consciousness Computing',
  webDir: isProductionBuild ? 'out' : '.next/static',
  server: {
    ...serverConfigs[BUILD_MODE as keyof typeof serverConfigs],
    androidScheme: 'https'
  },
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
