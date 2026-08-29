import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PUBLIC_PATHS = ['/login', '/register', '/admin/login', '/admin/register']

function normalizeSiteUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/$/, '')
}

function buildSitemapXml(siteUrl) {
  const urls = PUBLIC_PATHS.map((routePath, index) => {
    const priority = index === 0 ? '1.0' : index === 1 ? '0.9' : '0.6'
    return `  <url>
    <loc>${siteUrl}${routePath}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function buildRobotsTxt(siteUrl) {
  // Do not Disallow app routes — Lighthouse `is-crawlable` fails when the audited
  // URL (e.g. /dashboard) is blocked, which tanks SEO (~66). Auth already protects data.
  const sitemapLine = siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : '\n'
  return `# StudySync robots.txt
User-agent: *
Allow: /
${sitemapLine}`
}

function seoStaticPlugin(siteUrl) {
  const robotsBody = buildRobotsTxt(siteUrl)
  const sitemapBody = siteUrl ? buildSitemapXml(siteUrl) : null

  return {
    name: 'studysync-seo-static',
    configureServer(server) {
      // Run before Vite static/public so /robots.txt is never the SPA HTML fallback.
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0]
        if (pathname === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(robotsBody)
          return
        }
        if (pathname === '/sitemap.xml') {
          if (!sitemapBody) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end('Set VITE_SITE_URL to enable sitemap.xml')
            return
          }
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          res.end(sitemapBody)
          return
        }
        if (pathname === '/llms.txt') {
          next()
          return
        }
        next()
      })
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, '../dist')
      if (!fs.existsSync(outDir)) return
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsBody, 'utf8')
      if (sitemapBody) {
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapBody, 'utf8')
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL)

  return {
    plugins: [react(), tailwindcss(), seoStaticPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Repo root dist/ — matches Render publish directory
      outDir: path.resolve(__dirname, '../dist'),
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'livekit', test: /node_modules[\\/](?:livekit-client|@livekit)[\\/]/ },
              { name: 'react-vendor', test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/ },
              { name: 'router', test: /node_modules[\\/]react-router/ },
              { name: 'query', test: /node_modules[\\/]@tanstack[\\/]react-query/ },
              { name: 'charts-date', test: /node_modules[\\/]date-fns[\\/]/ },
            ],
          },
        },
      },
      chunkSizeWarningLimit: 900,
      cssCodeSplit: true,
      modulePreload: {
        polyfill: true,
      },
      target: 'es2022',
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
        },
      },
    },
  }
})
