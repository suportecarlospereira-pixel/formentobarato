import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.formento.express', // Identificador único do seu app na loja
  appName: 'Formento Express',
  webDir: 'dist', // Pasta onde o Vite gera o build
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Configurações futuras de plugins (Câmera, Push Notification)
  }
};

export default config;