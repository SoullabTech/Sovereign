import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.soullab.maia',
  appName: 'MAIA - LabTools & IPP',
  webDir: 'www',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'http'
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
