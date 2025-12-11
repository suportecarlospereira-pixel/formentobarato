import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './', // Removido para Vercel (usa a raiz padrão)
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, 
    port: 5173,
  }
});
