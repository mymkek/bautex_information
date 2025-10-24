import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // позволяет подключаться не только с localhost
    port: 5173, // dev-порт, можно оставить
    strictPort: true,
    allowedHosts: ['information.bautex.pro', 'localhost'], // разрешённые хосты
  },
})
