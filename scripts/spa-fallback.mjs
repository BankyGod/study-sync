import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const indexPath = path.join(distDir, 'index.html')
const fallbackPath = path.join(distDir, '404.html')
const publicFallbackPath = path.resolve(__dirname, '../frontend/public/404.html')

if (!fs.existsSync(indexPath)) {
  console.error('spa-fallback: dist/index.html not found — run npm run build first')
  process.exit(1)
}

if (fs.existsSync(publicFallbackPath)) {
  fs.copyFileSync(publicFallbackPath, fallbackPath)
  console.log('spa-fallback: copied frontend/public/404.html → dist/404.html (SPA path recovery)')
} else {
  fs.copyFileSync(indexPath, fallbackPath)
  console.log('spa-fallback: copied index.html → 404.html for client-side routing')
}
