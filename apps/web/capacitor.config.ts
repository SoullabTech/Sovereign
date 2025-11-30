import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soullab.maia',
  appName: 'MAIA Sovereign',
  webDir: 'dist',
  server: {
    url: 'http://localhost:3000/maia',
    cleartext: true,
    androidScheme: 'http'
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
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
