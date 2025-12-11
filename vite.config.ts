import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Isso libera o acesso pelo IP da rede (ex: 192.168.x.x)
    port: 5173,
  }
});
