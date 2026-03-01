import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const proxy = {}
  const comfyuiTarget = String(env.COMFYUI2API_BASE_URL || '').trim()
  if (comfyuiTarget) {
    proxy['/comfyui'] = {
      target: comfyuiTarget,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/comfyui/, ''),
    }
  }

  const soraTarget = String(env.SORA2API_BASE_URL || '').trim()
  if (soraTarget) {
    proxy['/v1'] = {
      target: soraTarget,
      changeOrigin: true,
      secure: false,
    }
  }

  return {
    plugins: [react()],
    base: './',
    server: {
      port: 5173,
      strictPort: true,
      host: '127.0.0.1',
      proxy,
    },
  }
})
