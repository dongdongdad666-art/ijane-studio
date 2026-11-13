import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()], publicDir: 'public-ijane',
  server: { host: '127.0.0.1', port: 5178, strictPort: true },
  preview: { host: '127.0.0.1', port: 5178, strictPort: true },
  build: { outDir: '../../outputs/20261113-IJane网站构建-v041', emptyOutDir: false },
});

