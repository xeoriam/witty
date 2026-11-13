/**
 * The `ctx` object the plugin expects. Shared by the Electron main process and
 * the headless smoke test so both exercise the same seam implementations.
 */
function createLogger(sink) {
  const write = (level, message) => {
    const line = typeof message === 'string' ? message : String(message)
    try {
      sink?.(`${level}: ${line}`)
    } catch {
      // Logging must never break the app.
    }
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
  }
  return {
    info: (message) => write('info', message),
    warn: (message) => write('warn', message),
    error: (message) => write('error', message),
    debug: (message) => write('info', message),
  }
}

function createContext({ storageDomain, webServer, logger, token }) {
  const disposers = []
  return {
    storageDomain,
    webServer,
    logger,
    connection: {
      requestRejection(req) {
        const received = req.headers['x-tp-token']
        const value = Array.isArray(received) ? received[0] : received
        return value === token ? undefined : 403
      },
    },
    effect(fn) {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
      return dispose
    },
    disposeAll() {
      for (const dispose of disposers.splice(0).reverse()) {
        try {
          dispose()
        } catch (error) {
          console.error(`[ctx] dispose failed: ${error?.message ?? error}`)
        }
      }
    },
  }
}

module.exports = { createContext, createLogger }
