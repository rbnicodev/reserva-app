import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.rbnico.aljawas.app',
  appName: 'Aljawas',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://aljawas-a3504.web.app/',
    cleartext: true
  }
};

export default config;
