import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zoon.agri.app',
  appName: 'Zone App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
