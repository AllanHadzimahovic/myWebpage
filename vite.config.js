import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** Return real 404s for missing /games/* assets (avoid SPA index.html fallback). */
function gamesExactFiles() {
  return {
    name: 'games-exact-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        if (!raw.startsWith('/games/')) {
          next()
          return
        }
        const filePath = path.join(rootDir, 'public', decodeURIComponent(raw))
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          next()
          return
        }
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('Unity WebGL file not found. Copy your WebGL build into public/games/unity/')
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), gamesExactFiles()],
})
