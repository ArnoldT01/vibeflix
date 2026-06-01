import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base is '/' in dev so public assets (star.svg, hero-bg.png, etc.) resolve
// correctly regardless of whether the browser URL has a trailing slash or not.
// In production the app is deployed to GitHub Pages under /vibeflix/, so the
// base must match. React Router's basename="/vibeflix" in main.jsx handles
// routing in both environments — it stays the same because the router basename
// is about URL path matching, not asset paths.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? '/vibeflix/' : '/',
}));
