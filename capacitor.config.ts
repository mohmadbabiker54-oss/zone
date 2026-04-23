import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zoon.agri.app',
  appName: 'زون للخدمات الزراعية',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
