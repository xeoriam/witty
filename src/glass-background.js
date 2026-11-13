const { React, h, useEffect, useRef, useState } = require('./shared.js')

const WALLPAPER_KEY = 'typing-practice:glass-wallpaper'
const DEFAULT_WALLPAPER = '/dsh-liquid-glass/assets/liquid-glass-deepwater.b209a409aea86fd6.jpg'
const MAX_FILE_BYTES = 8 * 1024 * 1024
const MAX_DATA_URL_CHARS = 3.5 * 1024 * 1024

function readStoredWallpaper() {
  try {
    const raw = window.localStorage.getItem(WALLPAPER_KEY)
    if (raw === null) return null
    const value = JSON.parse(raw)
    if (
      typeof value?.dataUrl === 'string'
      && value.dataUrl.startsWith('data:image/')
      && value.dataUrl.length <= MAX_DATA_URL_CHARS
    ) {
      return {
        dataUrl: value.dataUrl,
        name: typeof value.name === 'string' ? value.name : 'wallpaper',
      }
    }
  } catch {
    // A broken or oversized record falls back to the default wallpaper.
  }
  return null
}

function saveStoredWallpaper(value) {
  try {
    window.localStorage.setItem(WALLPAPER_KEY, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function clearStoredWallpaper() {
  try {
    window.localStorage.removeItem(WALLPAPER_KEY)
  } catch {
    // Removing a missing record is not an error.
  }
}

function imageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image-decode-failed'))
    }
    image.src = url
  })
}

async function compressWallpaper(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    throw new Error('backgroundUnsupported')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('backgroundTooLarge')
  }

  const image = await imageFromFile(file)
  const maxEdge = 1800
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('backgroundEncodeFailed')
  context.drawImage(image, 0, 0, width, height)

  let dataUrl = canvas.toDataURL('image/webp', 0.82)
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.84)
  }
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.62)
  }
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error('backgroundTooLarge')
  }
  return dataUrl
}

const BACKGROUND_CSS = `
  .tp-bgLayer {
    position: fixed;
    inset: 0;
    z-index: 130;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  }
  .tp-bgBackdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 6, 14, 0.58);
    backdrop-filter: blur(4px);
  }
  .tp-bgCard {
    position: relative;
    z-index: 1;
    width: min(620px, 100%);
    max-height: calc(100vh - 40px);
    overflow: auto;
    box-sizing: border-box;
    padding: 22px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(28, 43, 64, 0.96), rgba(10, 18, 32, 0.94));
    color: #f2f6ff;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
  }
  .tp-bgClose {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 8px;
    background: transparent;
    color: rgba(240, 246, 255, 0.72);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
  .tp-bgHeading {
    margin: 0;
    padding-right: 34px;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 650;
  }
  .tp-bgSubtitle {
    margin: 6px 0 0;
    color: rgba(230, 239, 255, 0.66);
    font-size: 12.5px;
    line-height: 1.65;
  }
  .tp-bgPreview {
    position: relative;
    height: 220px;
    margin-top: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.20);
    border-radius: 12px;
    background:
      radial-gradient(120% 90% at 10% 0%, rgba(95, 145, 220, 0.24), transparent 55%),
      #0b1423;
  }
  .tp-bgPreviewImage {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
  .tp-bgPreviewLabel {
    position: absolute;
    left: 12px;
    bottom: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(2, 8, 18, 0.56);
    color: rgba(242, 247, 255, 0.82);
    font-size: 11px;
    line-height: 1.4;
  }
  .tp-bgDrop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 76px;
    margin-top: 10px;
    padding: 12px;
    border: 1px dashed rgba(255, 255, 255, 0.28);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.045);
    color: rgba(230, 239, 255, 0.72);
    font-size: 12px;
    text-align: center;
    cursor: pointer;
  }
  .tp-bgDrop:hover {
    border-color: rgba(142, 197, 255, 0.65);
    color: #f2f6ff;
  }
  .tp-bgError {
    margin: 10px 0 0;
    color: #ff9a9a;
    font-size: 12px;
    line-height: 1.6;
  }
  .tp-bgActions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
  .tp-bgBtn {
    padding: 8px 13px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.08);
    color: #f2f6ff;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .tp-bgBtn:hover:not(:disabled) {
    border-color: rgba(142, 197, 255, 0.70);
    background: rgba(255, 255, 255, 0.14);
  }
  .tp-bgBtnPrimary {
    border-color: transparent;
    background: #8ec5ff;
    color: #08111f;
    font-weight: 650;
  }
  .tp-bgBtnPrimary:hover:not(:disabled) {
    background: #aad8ff;
  }
  .tp-bgBtn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .tp-bgHint {
    margin-top: 8px;
    color: rgba(230, 239, 255, 0.50);
    font-size: 11px;
    line-height: 1.55;
  }
  @media (max-width: 620px) {
    .tp-bgLayer { padding: 10px; }
    .tp-bgCard { padding: 18px 16px; }
    .tp-bgPreview { height: 180px; }
  }
`

function GlassBackgroundModal(props) {
  const { t, current, onApply, onRemove, onClose } = props
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(current?.dataUrl ?? null)
  const [name, setName] = useState(current?.name ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onClose])

  async function handleFile(file) {
    if (file === null) return
    setError('')
    setBusy(true)
    try {
      const dataUrl = await compressWallpaper(file)
      setPreview(dataUrl)
      setName(file.name)
    } catch (failure) {
      const code = failure?.message
      setError(
        code === 'backgroundUnsupported'
          ? t('backgroundUnsupported')
          : code === 'backgroundTooLarge'
            ? t('backgroundTooLarge')
            : t('backgroundReadFailed'),
      )
    } finally {
      setBusy(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    if (!busy) void handleFile(event.dataTransfer?.files?.[0] ?? null)
  }

  function apply() {
    if (preview === null || busy) return
    setBusy(true)
    setError('')
    try {
      onApply({ dataUrl: preview, name })
    } catch (failure) {
      setError(failure?.message || t('backgroundSaveFailed'))
      setBusy(false)
    }
  }

  function remove() {
    if (busy) return
    onRemove()
    onClose()
  }

  return h(
    'div',
    {
      className: 'tp-bgLayer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': t('backgroundTitle'),
      onClick: () => { if (!busy) onClose() },
    },
    h('div', { className: 'tp-bgBackdrop', 'aria-hidden': true }),
    h(
      'section',
      {
        className: 'tp-bgCard',
        onClick: (event) => event.stopPropagation(),
      },
      h('style', null, BACKGROUND_CSS),
      h(
        'button',
        {
          className: 'tp-bgClose',
          type: 'button',
          'aria-label': t('backgroundClose'),
          title: t('backgroundClose'),
          disabled: busy,
          onClick: onClose,
        },
        '×',
      ),
      h('h2', { className: 'tp-bgHeading' }, t('backgroundTitle')),
      h('p', { className: 'tp-bgSubtitle' }, t('backgroundSubtitle')),
      h(
        'div',
        { className: 'tp-bgPreview' },
        preview === null
          ? null
          : h('img', {
              className: 'tp-bgPreviewImage',
              src: preview,
              alt: name || t('backgroundPreview'),
            }),
        h(
          'span',
          { className: 'tp-bgPreviewLabel' },
          preview === null ? t('backgroundDefault') : (name || t('backgroundPreview')),
        ),
      ),
      h(
        'label',
        {
          className: 'tp-bgDrop',
          onDragOver: (event) => event.preventDefault(),
          onDrop: handleDrop,
        },
        h(
          'span',
          null,
          busy ? t('backgroundProcessing') : t('backgroundDrop'),
        ),
        h('span', null, t('backgroundFormats')),
        h('input', {
          ref: inputRef,
          type: 'file',
          accept: 'image/png,image/jpeg,image/webp',
          style: { display: 'none' },
          disabled: busy,
          onChange: (event) => {
            const file = event.target.files?.[0] ?? null
            event.target.value = ''
            void handleFile(file)
          },
        }),
      ),
      h('div', { className: 'tp-bgHint' }, t('backgroundHint')),
      error === '' ? null : h('p', { className: 'tp-bgError' }, error),
      h(
        'div',
        { className: 'tp-bgActions' },
        h(
          'button',
          {
            className: 'tp-bgBtn',
            type: 'button',
            disabled: busy,
            onClick: remove,
          },
          t('backgroundRemove'),
        ),
        h(
          'button',
          {
            className: 'tp-bgBtn tp-bgBtnPrimary',
            type: 'button',
            disabled: busy || preview === null,
            onClick: apply,
          },
          busy ? t('backgroundProcessing') : t('backgroundApply'),
        ),
      ),
    ),
  )
}

module.exports = {
  DEFAULT_WALLPAPER,
  GlassBackgroundModal,
  clearStoredWallpaper,
  readStoredWallpaper,
  saveStoredWallpaper,
}
