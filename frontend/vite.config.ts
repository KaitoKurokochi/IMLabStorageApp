import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000';
  const port = parseInt(env.VITE_PORT || '5173', 10);

  return {
    plugins: [react()],
    server: {
      port,
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/static': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
