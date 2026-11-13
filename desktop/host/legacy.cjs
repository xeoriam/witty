/**
 * P1 legacy-data discovery.
 *
 * Finds data written by the Harness plugin:
 *  - `%DSH_HOME%/storages/typing_practice_*` (storage-domain JSON)
 *  - `essay_archive/` folders next to the app or in sibling project folders
 *
 * The reader is deliberately permissive: storage-domain documents have changed
 * shape between plugin versions, so records are classified by their fields
 * (`type`+`text`, `score`+`timestamp`, `date`+`topic_prompt`) instead of by a
 * fixed file path.
 */
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')

const SKIP_DIRS = new Set(['node_modules', '.git', 'runtime', 'dist', 'build', 'backups', '.pnpm-store'])
const MAX_FILE_BYTES = 4 * 1024 * 1024
const MAX_FILES = 4000

async function readDir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

async function listJsonFiles(dir, depth = 0, budget = { left: MAX_FILES }) {
  if (depth > 6 || budget.left <= 0) return []
  const files = []
  for (const entry of await readDir(dir)) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listJsonFiles(full, depth + 1, budget))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      budget.left -= 1
      files.push(full)
    }
  }
  return files
}

function classify(value, bucket, seen) {
  if (Array.isArray(value)) {
    for (const item of value) classify(item, bucket, seen)
    return
  }
  if (value === null || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)

  if (value.rows !== null && typeof value.rows === 'object' && !Array.isArray(value.rows)) {
    for (const item of Object.values(value.rows)) classify(item, bucket, seen)
  }
  if (value.record !== null && typeof value.record === 'object') classify(value.record, bucket, seen)
  for (const key of ['items', 'records', 'attempts', 'favorites', 'topicHistory']) {
    if (Array.isArray(value[key])) classify(value[key], bucket, seen)
  }

  if (typeof value.id !== 'string') {
    if (typeof value.topic_prompt === 'string') bucket.topicHistory.push(value)
    return
  }

  const isFavorite = (value.type === 'vocabulary' || value.type === 'sentence' || value.type === 'word')
    && typeof value.text === 'string'
  if (isFavorite) {
    bucket.favorites.push(value)
    return
  }
  if (
    typeof value.date === 'string'
    && typeof value.topic_prompt === 'string'
    && (typeof value.user_essay === 'string' || typeof value.essay === 'string' || value.ai_feedback !== undefined)
  ) {
    bucket.essayArchive.push(value)
    return
  }
  if (value.category !== undefined && value.score !== undefined && value.timestamp !== undefined) {
    bucket.essayAttempts.push(value)
    return
  }
  if (typeof value.topic_prompt === 'string') bucket.topicHistory.push(value)
}

async function readJsonFile(file) {
  try {
    const stat = await fs.stat(file)
    if (stat.size > MAX_FILE_BYTES) return undefined
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return undefined
  }
}

async function scanDirectory(dir, bucket) {
  const seen = new Set()
  let found = 0
  for (const file of await listJsonFiles(dir)) {
    const value = await readJsonFile(file)
    if (value === undefined) continue
    const before = bucket.favorites.length + bucket.essayAttempts.length
      + bucket.essayArchive.length + bucket.topicHistory.length
    classify(value, bucket, seen)
    const after = bucket.favorites.length + bucket.essayAttempts.length
      + bucket.essayArchive.length + bucket.topicHistory.length
    if (after > before) found += after - before
  }
  return found
}

function uniqueById(records) {
  const map = new Map()
  for (const record of records) {
    if (record === null || typeof record !== 'object') continue
    const key = typeof record.id === 'string' && record.id.length > 0
      ? record.id
      : `anon:${JSON.stringify(record).slice(0, 120)}`
    if (!map.has(key)) map.set(key, record)
  }
  return Array.from(map.values())
}

function uniqueTopics(records) {
  const map = new Map()
  for (const record of records) {
    if (record === null || typeof record !== 'object') continue
    if (typeof record.topic_prompt !== 'string') continue
    const key = record.id ?? record.topic_prompt
    if (!map.has(key)) map.set(key, record)
  }
  return Array.from(map.values())
}

async function scanLegacy({ appRoot, dataRoot, dshHome }) {
  const bucket = { favorites: [], essayAttempts: [], essayArchive: [], topicHistory: [] }
  const sources = []

  const home = dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const storagesRoot = path.join(home, 'storages')
  for (const entry of await readDir(storagesRoot)) {
    if (!entry.isDirectory() || !entry.name.startsWith('typing_practice')) continue
    const dir = path.join(storagesRoot, entry.name)
    const found = await scanDirectory(dir, bucket)
    if (found > 0) sources.push({ kind: 'harness-storage', path: dir, records: found })
  }

  const archiveCandidates = new Set()
  archiveCandidates.add(path.join(appRoot, 'essay_archive'))
  const parent = path.dirname(appRoot)
  for (const sibling of await readDir(parent)) {
    if (!sibling.isDirectory() || SKIP_DIRS.has(sibling.name)) continue
    const siblingPath = path.join(parent, sibling.name)
    archiveCandidates.add(path.join(siblingPath, 'essay_archive'))
    for (const child of await readDir(siblingPath)) {
      if (!child.isDirectory() || SKIP_DIRS.has(child.name)) continue
      archiveCandidates.add(path.join(siblingPath, child.name, 'essay_archive'))
    }
  }

  const resolvedDataRoot = path.resolve(dataRoot)
  for (const dir of archiveCandidates) {
    const resolved = path.resolve(dir)
    if (resolved === resolvedDataRoot || resolved.startsWith(resolvedDataRoot + path.sep)) continue
    try {
      const stat = await fs.stat(resolved)
      if (!stat.isDirectory()) continue
    } catch {
      continue
    }
    const before = bucket.essayArchive.length + bucket.topicHistory.length
    await scanDirectory(resolved, bucket)
    const found = bucket.essayArchive.length + bucket.topicHistory.length - before
    if (found > 0) sources.push({ kind: 'essay-archive', path: resolved, records: found })
  }

  return {
    sources,
    data: {
      favorites: uniqueById(bucket.favorites),
      essayAttempts: uniqueById(bucket.essayAttempts),
      essayArchive: uniqueById(bucket.essayArchive),
      topicHistory: uniqueTopics(bucket.topicHistory),
    },
  }
}

module.exports = { scanLegacy }
