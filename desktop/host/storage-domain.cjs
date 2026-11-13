/**
 * P0 replacement for the Harness `ctx.storageDomain` seam.
 *
 * The plugin only needs `open(domain)` → `table(name)` with
 * `entries()/put(id, value)/delete(id)`; this implementation keeps each table
 * in a JSON document under the app's user-data directory and writes atomically.
 */
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const path = require('node:path')
const { randomUUID } = require('node:crypto')

function readTableFile(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object' && parsed.rows !== null && typeof parsed.rows === 'object') {
      return new Map(Object.entries(parsed.rows))
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      // A half-written table must not take the whole app down; start clean.
      console.error(`[storage] could not read ${file}: ${error?.message ?? error}`)
    }
  }
  return new Map()
}

function createTable(dir, name, valueSchema) {
  const file = path.join(dir, `${name}.json`)
  const rows = readTableFile(file)
  let queue = Promise.resolve()

  const persist = () => {
    queue = queue.then(async () => {
      await fsp.mkdir(dir, { recursive: true })
      const temp = `${file}.${randomUUID()}.tmp`
      await fsp.writeFile(temp, JSON.stringify({ version: 1, rows: Object.fromEntries(rows) }, null, 2), 'utf8')
      await fsp.rename(temp, file)
    }).catch((error) => {
      console.error(`[storage] could not write ${file}: ${error?.message ?? error}`)
    })
    return queue
  }

  return {
    name,
    entries() {
      return rows.entries()
    },
    async put(id, value) {
      const record = valueSchema && typeof valueSchema.parse === 'function'
        ? valueSchema.parse(value)
        : value
      rows.set(id, record)
      await persist()
      return record
    },
    async delete(id) {
      const deleted = rows.delete(id)
      if (deleted) await persist()
      return deleted
    },
    async flush() {
      await queue
    },
  }
}

function createStorageDomain(root, logger) {
  const cache = new Map()

  async function open(domain) {
    if (domain === null || typeof domain !== 'object' || typeof domain.name !== 'string') {
      throw new TypeError('storageDomain.open expects a domain definition')
    }
    if (cache.has(domain.name)) return cache.get(domain.name)

    const dir = path.join(root, 'storages', domain.name)
    await fsp.mkdir(dir, { recursive: true })
    const tables = new Map()

    const instance = {
      name: domain.name,
      table(name) {
        if (!tables.has(name)) {
          const spec = domain.tables?.[name]
          tables.set(name, createTable(dir, name, spec?.valueSchema))
        }
        return tables.get(name)
      },
      async close() {
        for (const table of tables.values()) await table.flush()
      },
    }

    cache.set(domain.name, instance)
    logger?.info?.(`[storage] opened ${domain.name} at ${dir}`)
    return instance
  }

  return { open, root }
}

module.exports = { createStorageDomain }
