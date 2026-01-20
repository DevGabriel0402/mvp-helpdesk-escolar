import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force reload
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
  }
})
