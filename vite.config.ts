import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  // En CI (GitHub Pages) la variable VITE_BASE est injectée par le workflow
  base: process.env.VITE_BASE ?? '/',
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
})
