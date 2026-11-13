/**
 * P2: API key at rest.
 *
 * The renderer never receives the key. The main process encrypts it with the OS
 * key store (Windows DPAPI via Electron safeStorage) and keeps it in memory for
 * the lifetime of the process. Only the main process talks to DeepSeek.
 */
const fs = require('node:fs')
const path = require('node:path')
const { safeStorage } = require('electron')

let cached = ''

function keyFile(userData) {
  return path.join(userData, 'secrets', 'deepseek.key')
}

function isAvailable() {
  try {
    return safeStorage.isEncryptionAvailable()
  } catch {
    return false
  }
}

function load(userData) {
  if (cached.length > 0) return cached
  try {
    const encoded = fs.readFileSync(keyFile(userData), 'utf8').trim()
    if (encoded.length === 0) return ''
    cached = safeStorage.decryptString(Buffer.from(encoded, 'base64'))
  } catch {
    cached = ''
  }
  return cached
}

function save(userData, key) {
  if (!isAvailable()) {
    throw new Error('当前系统不支持加密存储。')
  }
  fs.mkdirSync(path.dirname(keyFile(userData)), { recursive: true })
  const encrypted = safeStorage.encryptString(key).toString('base64')
  const temp = `${keyFile(userData)}.${Date.now()}.tmp`
  fs.writeFileSync(temp, encrypted, { mode: 0o600 })
  fs.renameSync(temp, keyFile(userData))
  cached = key
}

function clear(userData) {
  cached = ''
  try {
    fs.rmSync(keyFile(userData), { force: true })
  } catch {
    // Removing a missing key is not an error.
  }
}

module.exports = { isAvailable, load, save, clear }
