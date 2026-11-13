import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const { createStorageDomain } = require('./host/storage-domain.cjs')
const { createWebServer, startHttpServer } = require('./host/server.cjs')
const { createContext, createLogger } = require('./host/context.cjs')
const { scanLegacy } = require('./host/legacy.cjs')

const root = path.dirname(fileURLToPath(import.meta.url))
const dataRoot = path.join(root, '.smoke-data')
await fs.rm(dataRoot, { recursive: true, force: true })
process.env.TYPING_PRACTICE_DATA_DIR = dataRoot

const token = 'smoke-token'
let injectedKey = ''
const storageDomain = createStorageDomain(path.join(dataRoot, 'data'), createLogger())
const webServer = createWebServer()
const ctx = createContext({ storageDomain, webServer, logger: createLogger(), token })

const { apply } = await import(pathToFileURL(path.join(root, '..', 'index.js')).href)
apply(ctx)

const handle = await startHttpServer({
  webServer,
  rendererDir: path.join(root, 'renderer'),
  token,
  injectApiKey: () => injectedKey,
})
const base = `http://127.0.0.1:${handle.port}`

try {
  const page = await fetch(`${base}/`)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /app\.bundle\.js/)

  const bundle = await fetch(`${base}/app.bundle.js`)
  assert.equal(bundle.status, 200)
  assert.ok((await bundle.text()).includes('LearningShell'))

  const wallpaper = await fetch(`${base}/assets/default-wallpaper.svg`)
  assert.equal(wallpaper.status, 200)

  const denied = await fetch(`${base}/plugins/typing-practice/status`)
  assert.equal(denied.status, 403)

  const status = await fetch(`${base}/plugins/typing-practice/status`, {
    headers: { 'x-tp-token': token },
  })
  const statusBody = await status.json()
  assert.equal(statusBody.ok, false)
  assert.equal(statusBody.configured, false)
  assert.equal(statusBody.error.code, 'MISSING_API_KEY')

  const created = await fetch(`${base}/plugins/typing-practice/favorites`, {
    method: 'POST',
    headers: { 'x-tp-token': token, 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'sentence',
      text: 'Smoke sentence.',
      translation: '冒烟测试。',
    }),
  })
  assert.equal(created.status, 200)
  assert.equal((await created.json()).ok, true)

  const listed = await fetch(`${base}/plugins/typing-practice/favorites`, {
    headers: { 'x-tp-token': token },
  })
  assert.equal((await listed.json()).items.length, 1)

  const exported = await fetch(`${base}/plugins/typing-practice/data/export`, {
    headers: { 'x-tp-token': token },
  })
  const exportBody = await exported.json()
  assert.equal(exportBody.data.favorites.length, 1)
  assert.equal(JSON.stringify(exportBody).includes('sk-'), false)

  const missingKey = await fetch(`${base}/plugins/typing-practice/translate`, {
    method: 'POST',
    headers: { 'x-tp-token': token, 'content-type': 'application/json' },
    body: JSON.stringify({ sentence: 'Hello.' }),
  })
  assert.equal(missingKey.status, 401)
  assert.equal((await missingKey.json()).error.code, 'MISSING_API_KEY')

  injectedKey = 'sk-injected-key'
  const injectedStatus = await fetch(`${base}/plugins/typing-practice/status`, {
    headers: { 'x-tp-token': token },
  })
  const injectedBody = await injectedStatus.json()
  assert.equal(injectedBody.ok, true, 'main-injected key satisfies the status route')
  assert.equal(injectedBody.configured, true)
  injectedKey = ''

  const persisted = await fs.readFile(
    path.join(dataRoot, 'data', 'storages', 'typing_practice_favorites', 'favorites.json'),
    'utf8',
  )
  assert.match(persisted, /Smoke sentence\./)

  const merged = await fetch(`${base}/plugins/typing-practice/data/import`, {
    method: 'POST',
    headers: { 'x-tp-token': token, 'content-type': 'application/json' },
    body: JSON.stringify({
      merge: true,
      data: {
        app: 'typing-practice',
        schemaVersion: 1,
        favorites: [{ id: 'legacy-fav-1', type: 'vocabulary', text: 'legacy', translation: '旧词' }],
        essayAttempts: [],
      },
    }),
  })
  assert.equal(merged.status, 200)
  assert.equal((await merged.json()).imported.favorites, 1)
  const afterMerge = await fetch(`${base}/plugins/typing-practice/favorites`, {
    headers: { 'x-tp-token': token },
  })
  assert.equal((await afterMerge.json()).items.length, 2, 'merge keeps existing favorites')

  const legacyApp = path.join(dataRoot, 'legacy-app')
  const legacyArchive = path.join(legacyApp, 'essay_archive', '2026', '01')
  await fs.mkdir(legacyArchive, { recursive: true })
  await fs.writeFile(path.join(legacyArchive, 'essay-1.json'), JSON.stringify({
    id: 'essay-1',
    date: '2026-01-01T00:00:00.000Z',
    category: { id: 'society', label: '社会热点', subcategory: null },
    topic_prompt: 'A legacy prompt',
    user_essay: 'legacy essay',
  }), 'utf8')
  await fs.writeFile(path.join(legacyApp, 'essay_archive', 'topic-history.json'), JSON.stringify([
    { id: 'topic-1', date: '2026-01-01T00:00:00.000Z', category: 'society', topic_prompt: 'A legacy prompt' },
  ]), 'utf8')

  const scanned = await scanLegacy({
    appRoot: legacyApp,
    dataRoot: path.join(dataRoot, 'unrelated'),
    dshHome: path.join(dataRoot, 'no-dsh-home'),
  })
  assert.equal(scanned.data.essayArchive.length, 1)
  assert.equal(scanned.data.topicHistory.length, 1)
  assert.ok(scanned.sources.some((source) => source.kind === 'essay-archive'))

  const mergedArchive = await fetch(`${base}/plugins/typing-practice/data/import`, {
    method: 'POST',
    headers: { 'x-tp-token': token, 'content-type': 'application/json' },
    body: JSON.stringify({
      merge: true,
      data: {
        app: 'typing-practice',
        schemaVersion: 1,
        essayArchive: [{
          id: 'essay-legacy-1',
          date: '2026-01-02T00:00:00.000Z',
          category: { id: 'society', label: '社会热点', subcategory: null },
          topic_prompt: 'Legacy prompt',
          user_essay: 'Legacy essay body.',
        }],
        topicHistory: [{
          id: 'topic-legacy-1',
          date: '2026-01-02T00:00:00.000Z',
          category: 'society',
          topic_prompt: 'Legacy prompt',
        }],
      },
    }),
  })
  assert.equal(mergedArchive.status, 200)
  const archiveList = await fetch(`${base}/plugins/typing-practice/essay/archive`, {
    headers: { 'x-tp-token': token },
  })
  const archiveItems = (await archiveList.json()).items
  assert.equal(archiveItems.length, 1)
  assert.equal(archiveItems[0].id, 'essay-legacy-1')

  console.log('desktop-smoke-ok')
} finally {
  ctx.disposeAll()
  await handle.close()
  await fs.rm(dataRoot, { recursive: true, force: true })
}
