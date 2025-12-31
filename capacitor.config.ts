import type { CapacitorConfig } from '@capacitor/cli';

// Build mode: 'dev' for local development, 'beta' for TestFlight/internal testing, 'prod' for release
const BUILD_MODE = process.env.CAPACITOR_MODE || 'dev';

const serverConfigs = {
  dev: {
    // Local development - use LAN IP for physical device testing
    url: 'http://192.168.4.210:3000',
    cleartext: true,
  },
  beta: {
    // Beta testing - points to production backend
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
  webDir: '.next/static', // For production builds, use built static assets
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
    }
  }
};

export default config;
