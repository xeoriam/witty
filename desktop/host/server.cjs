/**
 * P0 replacement for the Harness `ctx.webServer` seam.
 *
 * Exact-path routes registered by the plugin are served on 127.0.0.1 together
 * with the renderer's static files. The renderer is loaded from the same origin,
 * so the plugin's relative `/plugins/typing-practice/...` requests need no CORS.
 */
const http = require('node:http')
const fsp = require('node:fs/promises')
const path = require('node:path')

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function createWebServer() {
  const routes = new Map()

  return {
    routes,
    register(route) {
      if (route === null || typeof route !== 'object') throw new TypeError('route must be an object')
      if (typeof route.path !== 'string' || route.path.length === 0) throw new TypeError('route.path is required')
      if (typeof route.handler !== 'function') throw new TypeError('route.handler is required')
      routes.set(route.path, route)
      return () => routes.delete(route.path)
    },
  }
}

async function serveStatic(res, rendererDir, pathname) {
  const relative = pathname.replace(/^\/+/, '')
  const resolved = path.resolve(rendererDir, relative)
  const root = path.resolve(rendererDir)
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Forbidden')
    return
  }

  try {
    const body = await fsp.readFile(resolved)
    const type = CONTENT_TYPES[path.extname(resolved).toLowerCase()] ?? 'application/octet-stream'
    res.writeHead(200, {
      'content-type': type,
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }
    console.error(`[static] ${pathname}: ${error?.message ?? error}`)
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Internal error')
  }
}

function startHttpServer({ webServer, rendererDir, token, version, injectApiKey }) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')

    if (url.pathname.startsWith('/plugins/typing-practice')) {
      const route = webServer.routes.get(url.pathname)
      if (route === undefined) {
        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: { code: 'NOT_FOUND', message: '未知接口。' } }))
        return
      }
      if (typeof injectApiKey === 'function' && req.headers['x-deepseek-api-key'] === undefined) {
        try {
          const key = injectApiKey(url.pathname)
          if (typeof key === 'string' && key.length > 0) {
            req.headers['x-deepseek-api-key'] = key
          }
        } catch {
          // A missing key simply leaves the header absent.
        }
      }
      try {
        await route.handler(req, res)
      } catch (error) {
        console.error(`[route] ${url.pathname}: ${error?.stack ?? error}`)
        if (!res.writableEnded) {
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: { code: 'INTERNAL', message: '本地服务异常。' } }))
        }
      }
      return
    }

    if (url.pathname === '/__tp_bootstrap.js') {
      res.writeHead(200, { 'content-type': CONTENT_TYPES['.js'], 'cache-control': 'no-store' })
      res.end(`window.__TP_TOKEN__ = ${JSON.stringify(token)}\nwindow.__TP_DESKTOP__ = true\nwindow.__TP_VERSION__ = ${JSON.stringify(version ?? '')}\n`)
      return
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      await serveStatic(res, rendererDir, '/index.html')
      return
    }

    if (url.pathname === '/favicon.ico') {
      res.writeHead(204)
      res.end()
      return
    }

    await serveStatic(res, rendererDir, url.pathname)
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({
        server,
        port: typeof address === 'object' && address !== null ? address.port : 0,
        close: () => new Promise((done) => server.close(() => done())),
      })
    })
  })
}

module.exports = { createWebServer, startHttpServer }
