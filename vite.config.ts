import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']
      .filter(name => !(process.env[name] || env[name])?.trim())
    if (missing.length) {
      throw new Error(`Missing build variables: ${missing.join(', ')}. Set them in the build environment or local .env before deploying.`)
    }
  }
  return { plugins: [react(), cloudflare()] }
})
