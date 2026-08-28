import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo at https://<owner>.github.io/hasm-top/, so
// asset URLs need that subpath prefix. Set GITHUB_PAGES=true only in the
// Pages deploy workflow; local dev/build stay rooted at "/".
const base = process.env.GITHUB_PAGES === 'true' ? '/hasm-top/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
