/**
 * P0 desktop shell: Electron main process.
 *
 * It boots the unchanged plugin host logic (`../index.js`) against a local
 * `ctx` shim, serves its routes plus the renderer on 127.0.0.1, and opens a
 * normal desktop window. No Harness process is involved.
 */
const { app, BrowserWindow, shell, screen, ipcMain } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const { randomBytes } = require('node:crypto')
const { pathToFileURL } = require('node:url')
const { createStorageDomain } = require('./host/storage-domain.cjs')
const { createWebServer, startHttpServer } = require('./host/server.cjs')
const { createContext, createLogger } = require('./host/context.cjs')
const { scanLegacy } = require('./host/legacy.cjs')
const apiKeyStore = require('./host/api-key.cjs')

const ROUTE_BASE = '/plugins/typing-practice'

if (app === undefined) {
  console.error('Electron API unavailable: ELECTRON_RUN_AS_NODE must not be set when launching the app.')
  process.exit(1)
}

// Chromium's sandbox cannot start on some Windows setups (security policy /
// antivirus), and a packaged app that starts without `--no-sandbox` exits
// before this script runs — the flag strictly has to be on the command line, so
// no in-app fallback is possible. Every entry point we ship passes it:
// the installer-created shortcuts (build/installer.nsh), the desktop shortcut
// helper (make-shortcut.ps1), and the documented `Witty.exe --no-sandbox …`
// command line.

const TOKEN = randomBytes(24).toString('hex')

// Portable/dev override: point the app's data at an explicit directory. Real
// installs leave this unset and use %APPDATA%\<app>.
//
// Priority, highest first:
//   1. `--data-dir <path>` / `--data-dir=<path>` — the desktop shortcut uses
//      this so a portable copy keeps its data next to the program without a
//      .cmd wrapper (which flashes a console window on every launch).
//   2. `MY_WRITING_DATA_DIR` — kept for the old launcher scripts.
//   3. Electron's default (`%APPDATA%\<productName>`).
function resolveDataDirOverride(argv) {
  const args = Array.isArray(argv) ? argv : []
  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index] ?? '')
    if (arg === '--data-dir') {
      const next = String(args[index + 1] ?? '').trim()
      if (next.length > 0 && !next.startsWith('--')) return next
    } else if (arg.startsWith('--data-dir=')) {
      const value = arg.slice('--data-dir='.length).trim()
      if (value.length > 0) return value
    }
  }
  const fromEnv = process.env.MY_WRITING_DATA_DIR
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return fromEnv.trim()
  return ''
}

const dataDirOverride = resolveDataDirOverride(process.argv)
if (dataDirOverride !== '') {
  // Relative paths resolve against the working directory, which the shortcut
  // sets to the folder that holds Witty.exe.
  const target = path.resolve(dataDirOverride)
  try {
    fs.mkdirSync(target, { recursive: true })
    app.setPath('userData', target)
    console.log(`[app] data dir override: ${target}`)
  } catch (error) {
    console.error(`[app] could not use data dir ${target}: ${error?.message ?? error}`)
  }
}

let mainWindow = null
let httpHandle = null
let pluginCtx = null

function logToFile(line) {
  try {
    const dir = path.join(app.getPath('userData'), 'logs')
    fs.mkdirSync(dir, { recursive: true })
    fs.appendFileSync(path.join(dir, 'startup.log'), `[${new Date().toISOString()}] ${line}\n`)
  } catch {
    // Logging must never prevent the app from starting.
  }
}

process.on('uncaughtException', (error) => {
  logToFile(`uncaught: ${error?.stack ?? error}`)
})
process.on('unhandledRejection', (error) => {
  logToFile(`rejection: ${error?.stack ?? error}`)
})

function makeLogger() {
  return createLogger(logToFile)
}

function sendJson(res, status, payload) {
  if (res.writableEnded) return
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

function rejectUnauthorized(req, res) {
  const rejection = pluginCtx?.connection?.requestRejection(req)
  if (rejection === undefined) return false
  res.writeHead(rejection, { 'cache-control': 'no-store' })
  res.end()
  return true
}

function legacyCounts(data) {
  return {
    favorites: data.favorites.length,
    essayAttempts: data.essayAttempts.length,
    essayArchive: data.essayArchive.length,
    topicHistory: data.topicHistory.length,
  }
}

function totalCount(counts) {
  return counts.favorites + counts.essayAttempts + counts.essayArchive + counts.topicHistory
}

async function handleLegacyScan(req, res, options) {
  if (rejectUnauthorized(req, res)) return
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: '只支持 GET。' } })
    return
  }
  try {
    const result = await scanLegacy(options)
    sendJson(res, 200, {
      ok: true,
      sources: result.sources,
      counts: legacyCounts(result.data),
    })
  } catch (error) {
    logToFile(`legacy scan failed: ${error?.stack ?? error}`)
    sendJson(res, 500, { ok: false, error: { code: 'SCAN_FAILED', message: '扫描旧数据失败。' } })
  }
}

async function handleLegacyImport(req, res, options) {
  if (rejectUnauthorized(req, res)) return
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: '只支持 POST。' } })
    return
  }
  try {
    const result = await scanLegacy(options)
    const counts = legacyCounts(result.data)
    if (totalCount(counts) === 0) {
      sendJson(res, 200, { ok: true, imported: null, counts, sources: result.sources })
      return
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(options.userData, 'backups', stamp)
    await fs.promises.mkdir(path.dirname(backupDir), { recursive: true })
    try {
      await fs.promises.cp(options.dataRoot, backupDir, { recursive: true })
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }

    const response = await fetch(`http://127.0.0.1:${httpHandle.port}${ROUTE_BASE}/data/import`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tp-token': TOKEN },
      body: JSON.stringify({
        merge: true,
        data: {
          app: 'typing-practice',
          schemaVersion: 1,
          favorites: result.data.favorites,
          essayAttempts: result.data.essayAttempts,
          essayArchive: result.data.essayArchive,
          topicHistory: result.data.topicHistory,
        },
      }),
    })
    const payload = await response.json().catch(() => undefined)
    if (!response.ok || payload?.ok !== true) {
      sendJson(res, 502, {
        ok: false,
        error: payload?.error ?? { code: 'IMPORT_FAILED', message: '写入旧数据失败。' },
        counts,
        backup: backupDir,
      })
      return
    }
    sendJson(res, 200, {
      ok: true,
      imported: payload.imported ?? null,
      counts,
      sources: result.sources,
      backup: backupDir,
    })
  } catch (error) {
    logToFile(`legacy import failed: ${error?.stack ?? error}`)
    sendJson(res, 500, { ok: false, error: { code: 'IMPORT_FAILED', message: '导入旧数据失败。' } })
  }
}

async function testDeepSeekKey(key) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch('https://api.deepseek.com/user/balance', {
      headers: { authorization: `Bearer ${key}` },
      signal: controller.signal,
    })
    const text = await response.text()
    if (!response.ok) {
      const message = response.status === 401
        ? 'Key 无效或已过期。'
        : `DeepSeek 返回 ${response.status}。`
      return { ok: false, code: 'DEEPSEEK_ERROR', message }
    }
    let payload
    try {
      payload = JSON.parse(text)
    } catch {
      return { ok: false, code: 'BAD_RESPONSE', message: 'DeepSeek 返回了无法解析的响应。' }
    }
    const infos = Array.isArray(payload?.balance_infos) ? payload.balance_infos : []
    return {
      ok: true,
      available: payload?.is_available === true,
      balances: infos.map((info) => ({
        currency: typeof info?.currency === 'string' ? info.currency : '',
        total: typeof info?.total_balance === 'string' ? info.total_balance : '',
      })),
    }
  } catch (error) {
    return {
      ok: false,
      code: error?.name === 'AbortError' ? 'TIMEOUT' : 'TRANSPORT',
      message: error?.name === 'AbortError' ? '测试连接超时。' : '无法连接 DeepSeek。',
    }
  } finally {
    clearTimeout(timer)
  }
}

function compareVersions(left, right) {
  const a = String(left).split('.').map((part) => Number.parseInt(part, 10) || 0)
  const b = String(right).split('.').map((part) => Number.parseInt(part, 10) || 0)
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) > (b[index] ?? 0) ? 1 : -1
  }
  return 0
}

function registerIpc({ userData, dataRoot }) {
  const trusted = (event) => String(event?.senderFrame?.url ?? '').startsWith('http://127.0.0.1:')
  const handle = (channel, fn) => {
    ipcMain.handle(channel, async (event, ...args) => {
      if (!trusted(event)) throw new Error('untrusted sender')
      return fn(...args)
    })
  }

  handle('tp:key:has', () => ({
    configured: apiKeyStore.load(userData).length > 0,
    encrypted: apiKeyStore.isAvailable(),
  }))

  handle('tp:key:set', (key) => {
    const value = typeof key === 'string' ? key.trim() : ''
    if (!/^[\x21-\x7e]{10,200}$/.test(value)) {
      return { ok: false, code: 'INVALID_API_KEY', message: 'Key 格式不正确。' }
    }
    try {
      apiKeyStore.save(userData, value)
      return { ok: true }
    } catch (error) {
      return { ok: false, code: 'SAVE_FAILED', message: error?.message ?? '保存失败。' }
    }
  })

  handle('tp:key:clear', () => {
    apiKeyStore.clear(userData)
    return { ok: true }
  })

  handle('tp:key:test', async () => {
    const key = apiKeyStore.load(userData)
    if (key.length === 0) {
      return { ok: false, code: 'MISSING_API_KEY', message: '请先保存 API Key。' }
    }
    return testDeepSeekKey(key)
  })

  handle('tp:data:dir', () => dataRoot)

  handle('tp:win:minimize', () => { mainWindow?.minimize(); return { ok: true } })
  handle('tp:win:maximize', () => {
    if (mainWindow === null) return { ok: false }
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
    return { ok: true }
  })
  handle('tp:win:close', () => { mainWindow?.close(); return { ok: true } })

  handle('tp:data:open', async () => {
    const error = await shell.openPath(dataRoot)
    return { ok: error === '', message: error }
  })

  handle('tp:update:check', async () => {
    const repo = typeof process.env.TP_UPDATE_REPO === 'string' ? process.env.TP_UPDATE_REPO.trim() : ''
    if (repo.length === 0) {
      return { ok: false, code: 'NO_FEED', message: '未配置更新源。' }
    }
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { 'user-agent': 'my-writing', accept: 'application/vnd.github+json' },
      })
      if (!response.ok) {
        return { ok: false, code: 'HTTP_' + response.status, message: `更新服务器返回 ${response.status}。` }
      }
      const payload = await response.json()
      const latest = String(payload?.tag_name ?? '').replace(/^v/i, '')
      const current = app.getVersion()
      return {
        ok: true,
        current,
        latest,
        hasUpdate: latest.length > 0 && compareVersions(latest, current) > 0,
        url: typeof payload?.html_url === 'string' ? payload.html_url : '',
      }
    } catch {
      return { ok: false, code: 'TRANSPORT', message: '无法连接更新服务器。' }
    }
  })
}

async function start() {
  logToFile('start')
  const userData = app.getPath('userData')
  const dataRoot = path.join(userData, 'data')
  // index.js resolves its essay archive from this env var when present.
  process.env.TYPING_PRACTICE_DATA_DIR = dataRoot

  const pluginRoot = app.isPackaged ? process.resourcesPath : path.resolve(__dirname, '..')
  registerIpc({ userData, dataRoot })
  const storageDomain = createStorageDomain(path.join(dataRoot), console)
  const webServer = createWebServer()
  pluginCtx = createContext({
    storageDomain,
    webServer,
    logger: makeLogger(),
    token: TOKEN,
  })

  const { apply } = await import(pathToFileURL(path.join(pluginRoot, 'index.js')).href)
  apply(pluginCtx)

  webServer.register({
    path: `${ROUTE_BASE}/data/legacy/scan`,
    handler: (req, res) => handleLegacyScan(req, res, { appRoot: pluginRoot, dataRoot }),
  })
  webServer.register({
    path: `${ROUTE_BASE}/data/legacy/import`,
    handler: (req, res) => handleLegacyImport(req, res, { appRoot: pluginRoot, dataRoot, userData }),
  })

  httpHandle = await startHttpServer({
    webServer,
    rendererDir: path.join(__dirname, 'renderer'),
    token: TOKEN,
    version: app.getVersion(),
    injectApiKey: () => apiKeyStore.load(userData),
  })

  console.log(`[app] data: ${dataRoot}`)
  console.log(`[app] renderer: http://127.0.0.1:${httpHandle.port}/`)
  logToFile(`listening on ${httpHandle.port}, data=${dataRoot}`)
}

function createWindow() {
  const workArea = screen.getPrimaryDisplay().workAreaSize
  const width = Math.min(1440, Math.max(900, workArea.width))
  const height = Math.min(960, Math.max(620, workArea.height))

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: Math.min(980, width),
    minHeight: Math.min(640, height),
    backgroundColor: '#070d14',
    title: 'Witty',
    icon: path.join(__dirname, 'renderer', 'assets', 'icon.png'),
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.loadURL(`http://127.0.0.1:${httpHandle.port}/`)
  mainWindow.maximize()

  mainWindow.webContents.once('did-finish-load', () => {
    if (app.isPackaged) return
    setTimeout(async () => {
      try {
        const snapshot = await mainWindow.webContents.executeJavaScript(
          `JSON.stringify({ text: (document.getElementById('root')?.innerText ?? '').slice(0, 240), errors: window.__TP_ERRORS__ ?? null })`,
        )
        logToFile(`renderer: ${snapshot}`)
      } catch (error) {
        logToFile(`renderer probe failed: ${error?.message ?? error}`)
      }
    }, 2500)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const target = new URL(url)
    if (target.origin !== `http://127.0.0.1:${httpHandle.port}`) {
      event.preventDefault()
      if (/^https?:/i.test(url)) void shell.openExternal(url)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const hasLock = app.requestSingleInstanceLock()
if (!hasLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow !== null) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    try {
      await start()
      createWindow()
    } catch (error) {
      console.error(error)
      logToFile(`start failed: ${error?.stack ?? error}`)
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null && httpHandle !== null) createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('before-quit', () => {
    try {
      pluginCtx?.disposeAll()
    } catch (error) {
      console.error(`[app] dispose failed: ${error?.message ?? error}`)
    }
    void httpHandle?.close()
  })
}
