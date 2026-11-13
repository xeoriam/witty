const SUPPORTED_EXTENSIONS = new Set(['txt', 'docx'])
const MAX_FILE_BYTES = 20 * 1024 * 1024
const MIN_ARTICLE_CHARS = 20

class ImportArticleError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ImportArticleError'
    this.code = code
  }
}

function extensionOf(filename) {
  const match = /\.([^.\\/]+)$/.exec(String(filename))
  return match === null ? '' : match[1].toLowerCase()
}

function normalizeArticleText(value) {
  return String(value ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/^[ \t]+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function assertArticleText(text) {
  if (text.length < MIN_ARTICLE_CHARS) {
    throw new ImportArticleError(
      'TEXT_TOO_SHORT',
      '没有提取到足够的英文文本，请检查文件内容或改用粘贴导入。',
    )
  }
  return text
}

function validateImportFile(file) {
  if (file === null || file === undefined) {
    throw new ImportArticleError('NO_FILE', '请先选择一个文件。')
  }
  const extension = extensionOf(file.name)
  if (extension === 'doc' || extension === 'pdf') {
    throw new ImportArticleError(
      'UNSUPPORTED_DOCUMENT',
      '请另存为 .docx 或 .txt 后再上传。',
    )
  }
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new ImportArticleError('UNSUPPORTED_TYPE', '仅支持 .txt 和 .docx 文件。')
  }
  if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
    throw new ImportArticleError('FILE_TOO_LARGE', '文件超过 20 MB，请选择更小的文件。')
  }
  return extension
}

function titleFromFile(filename) {
  const name = String(filename ?? '').replace(/\.[^.]+$/, '').trim()
  return name.length === 0 ? 'Imported Article' : name.slice(0, 120)
}

function sentenceSegments(text) {
  const normalized = String(text).replace(/\s+/g, ' ').trim()
  if (normalized.length === 0) return []
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
      return Array.from(
        new Intl.Segmenter('en', { granularity: 'sentence' }).segment(normalized),
        (part) => part.segment.trim(),
      ).filter(Boolean)
    }
  } catch {
    // Fall through to the punctuation splitter.
  }
  return (normalized.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [normalized])
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function groupSentences(sentences, size = 3) {
  const groups = []
  for (let index = 0; index < sentences.length; index += size) {
    groups.push(sentences.slice(index, index + size).join(' '))
  }
  return groups
}

function paragraphsFromBody(body) {
  const normalized = String(body).trim()
  if (normalized.length === 0) return []
  const blocks = normalized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)
  if (blocks.length > 1) return blocks
  const sentences = sentenceSegments(normalized)
  if (sentences.length <= 3) return [normalized]
  return groupSentences(sentences, 3)
}

function detectTitle(text) {
  const lines = String(text).split(/\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return null
  const first = lines[0]
    .replace(/^#{1,6}\s*/, '')
    .replace(/^(?:title|题目)\s*[:：]\s*/i, '')
    .replace(/^["“”']+|["“”']+$/g, '')
    .trim()
  if (first.length === 0 || first.length > 120) return null
  const words = first.split(/\s+/).filter(Boolean)
  if (words.length > 14) return null
  if (/[.!?。！？]$/.test(first) && words.length > 8) return null
  return first
}

/**
 * Detect a leading title and turn the remaining text into readable paragraphs.
 * Blank-line blocks win; a single dense block is grouped into 3-sentence paragraphs.
 */
function structureArticleText(raw, fallbackTitle) {
  const normalized = normalizeArticleText(raw)
  const detected = detectTitle(normalized)
  let title = typeof fallbackTitle === 'string' && fallbackTitle.trim().length > 0
    ? fallbackTitle.trim().slice(0, 120)
    : 'Imported Article'
  let body = normalized

  if (detected !== null) {
    const firstBreak = normalized.indexOf('\n')
    if (firstBreak !== -1) {
      title = detected
      body = normalized.slice(firstBreak + 1).trim()
    }
  }

  const paragraphs = paragraphsFromBody(body)
  return {
    title,
    paragraphs,
    text: paragraphs.join('\n\n'),
  }
}

function mammothRuntime() {
  const runtime = typeof window !== 'undefined' ? window.mammoth : undefined
  if (runtime === undefined || typeof runtime.extractRawText !== 'function') {
    throw new ImportArticleError(
      'DOCX_UNAVAILABLE',
      '当前构建未包含 .docx 解析组件。请先用粘贴导入，或安装 mammoth 后重新构建。',
    )
  }
  return runtime
}

async function extractArticleFile(file) {
  const extension = validateImportFile(file)

  try {
    if (extension === 'txt') {
      return assertArticleText(normalizeArticleText(await file.text()))
    }

    const mammoth = mammothRuntime()
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return assertArticleText(normalizeArticleText(result?.value ?? ''))
  } catch (error) {
    if (error instanceof ImportArticleError) throw error
    throw new ImportArticleError(
      'FILE_PARSE_FAILED',
      `读取文件失败：${error?.message || '未知错误'}`,
    )
  }
}

module.exports = {
  ImportArticleError,
  MAX_FILE_BYTES,
  MIN_ARTICLE_CHARS,
  assertArticleText,
  extractArticleFile,
  extensionOf,
  normalizeArticleText,
  paragraphsFromBody,
  structureArticleText,
  titleFromFile,
  validateImportFile,
}
