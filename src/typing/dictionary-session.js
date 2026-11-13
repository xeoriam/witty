const DICTIONARY_WORKSPACE_KEY = 'typing-practice-dictionary'
const DICTIONARY_ORIGINS = [
  'https://www.ldoceonline.com',
  'https://www.oxfordlearnersdictionaries.com',
]

let warmPromise

function preconnectDictionaryOrigins() {
  if (typeof document === 'undefined' || document.head === null) return
  const add = (origin, rel) => {
    const existing = document.head.querySelector(
      `link[data-typing-dictionary="${origin}"][rel="${rel}"]`,
    )
    if (existing !== null) return
    const link = document.createElement('link')
    link.rel = rel
    link.href = origin
    link.dataset.typingDictionary = origin
    document.head.append(link)
  }
  for (const origin of DICTIONARY_ORIGINS) {
    add(origin, 'preconnect')
    add(origin, 'dns-prefetch')
  }
}

function prewarmDictionarySession() {
  if (warmPromise !== undefined) return warmPromise
  const bridge = window.dshDesktop?.browser
  if (
    bridge === undefined
    || bridge === null
    || typeof bridge.acquire !== 'function'
    || typeof bridge.release !== 'function'
  ) {
    return Promise.resolve()
  }

  warmPromise = (async () => {
    const reservation = await bridge.acquire(DICTIONARY_WORKSPACE_KEY)
    await bridge.release(reservation.lease)
  })().catch(() => {
    warmPromise = undefined
  })
  return warmPromise
}

module.exports = {
  DICTIONARY_WORKSPACE_KEY,
  DICTIONARY_ORIGINS,
  preconnectDictionaryOrigins,
  prewarmDictionarySession,
}
