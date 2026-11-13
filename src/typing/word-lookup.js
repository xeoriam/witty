const WORD_PATTERN = /[A-Za-z]+(?:['’\-][A-Za-z]+)*/g

function tokenizeSentence(text) {
  const source = String(text)
  const tokens = []
  let lastUtf16 = 0
  let lastCodePoint = 0

  for (const match of source.matchAll(WORD_PATTERN)) {
    const prefix = source.slice(lastUtf16, match.index)
    if (prefix.length > 0) {
      tokens.push({
        type: 'text',
        value: prefix,
        start: lastCodePoint,
      })
      lastCodePoint += Array.from(prefix).length
    }

    tokens.push({
      type: 'word',
      value: match[0],
      start: lastCodePoint,
    })
    lastCodePoint += Array.from(match[0]).length
    lastUtf16 = match.index + match[0].length
  }

  const tail = source.slice(lastUtf16)
  if (tail.length > 0) {
    tokens.push({
      type: 'text',
      value: tail,
      start: lastCodePoint,
    })
  }

  return tokens
}

function wordCacheKey(word) {
  return String(word).toLowerCase()
}

function dictionarySlug(word) {
  return String(word ?? '')
    .trim()
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/[^\p{L}\p{N}]+$/u, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join('-')
}

function dictionaryUrl(provider, word) {
  const slug = dictionarySlug(word)
  if (slug.length === 0) return null
  const base = provider === 'longman'
    ? 'https://www.ldoceonline.com/dictionary/'
    : provider === 'oxford'
      ? 'https://www.oxfordlearnersdictionaries.com/definition/english/'
      : null
  if (base === null) return null
  return `${base}${encodeURIComponent(slug)}`
}

module.exports = {
  tokenizeSentence,
  wordCacheKey,
  dictionarySlug,
  dictionaryUrl,
}
