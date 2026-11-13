const { React, h, useEffect, useRef, useState } = require('../shared.js')
const {
  assertArticleText,
  extractArticleFile,
  structureArticleText,
  titleFromFile,
  validateImportFile,
} = require('./article-import.js')

const IMPORT_CSS = `
  .tp-importLayer {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 24px;
  }
  .tp-importBackdrop {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--dsw-alias-bg-base) 52%, transparent);
  }
  .tp-importModal {
    position: relative;
    z-index: 1;
    width: min(680px, 100%);
    max-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    background: var(--dsw-alias-bg-base);
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 16px;
    box-shadow: 0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
  }
  .tp-importHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 17px 18px 12px;
    border-bottom: 1px solid var(--dsw-alias-border-l1);
  }
  .tp-importHeading { min-width: 0; }
  .tp-importTitle {
    margin: 0;
    font-size: 16px;
    line-height: 1.35;
    font-weight: 650;
  }
  .tp-importSubtitle {
    margin: 4px 0 0;
    color: var(--dsw-alias-label-secondary);
    font-size: 11.5px;
    line-height: 1.55;
  }
  .tp-importClose {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 7px;
    background: transparent;
    color: var(--dsw-alias-label-secondary);
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
  }
  .tp-importClose:hover { color: var(--dsw-alias-label-primary); }
  .tp-importTabs {
    display: flex;
    gap: 6px;
    padding: 10px 16px 0;
  }
  .tp-importTab {
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--dsw-alias-label-secondary);
    padding: 6px 10px;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .tp-importTabActive {
    border-color: var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1);
    color: var(--dsw-alias-label-primary);
    font-weight: 600;
  }
  .tp-importBody {
    overflow: auto;
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .tp-importLabel {
    color: var(--dsw-alias-label-secondary);
    font-size: 11.5px;
    line-height: 1.5;
  }
  .tp-importTextarea {
    width: 100%;
    min-height: 220px;
    box-sizing: border-box;
    resize: vertical;
    padding: 10px 12px;
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 9px;
    outline: none;
    background: var(--dsw-alias-bg-base);
    color: var(--dsw-alias-label-primary);
    font: inherit;
    font-size: 13px;
    line-height: 1.65;
  }
  .tp-importTextarea:focus {
    border-color: var(--dsw-alias-brand-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
  }
  .tp-importTextarea::placeholder { color: var(--dsw-alias-label-secondary); }
  .tp-importDrop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 128px;
    padding: 22px 16px;
    border: 1px dashed var(--dsw-alias-border-l2);
    border-radius: 10px;
    background: var(--dsw-alias-bg-layer-1);
    text-align: center;
    cursor: pointer;
  }
  .tp-importDrop:hover { border-color: var(--dsw-alias-brand-primary); }
  .tp-importDropIcon {
    color: var(--dsw-alias-brand-primary);
    font-size: 24px;
    line-height: 1;
  }
  .tp-importDropText { font-size: 12.5px; line-height: 1.5; }
  .tp-importDropHint {
    color: var(--dsw-alias-label-secondary);
    font-size: 11px;
    line-height: 1.5;
  }
  .tp-importFileMeta {
    padding: 7px 9px;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 8px;
    background: var(--dsw-alias-bg-layer-1);
    color: var(--dsw-alias-label-primary);
    font-size: 11.5px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .tp-importHint {
    color: var(--dsw-alias-label-secondary);
    font-size: 10.5px;
    line-height: 1.55;
  }
  .tp-importError {
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base));
    color: var(--dsw-alias-state-error-primary);
    font-size: 11.5px;
    line-height: 1.55;
  }
  .tp-importFooter {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--dsw-alias-border-l1);
  }
  .tp-importPrimary {
    border-color: transparent;
    background: var(--dsw-alias-brand-primary);
    color: var(--dsw-alias-bg-base);
    font-weight: 600;
  }
  .tp-importPrimary:hover:not(:disabled) {
    background: var(--dsw-alias-brand-primary);
    border-color: transparent;
    opacity: .9;
  }
  .tp-importPrimary:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  /* Dark glass tier for the import dialog, matching the lookup modal. */
  .tp-importBackdrop {
    background: rgba(2, 6, 14, 0.60);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }
  .tp-importModal {
    border-color: rgba(255, 255, 255, 0.22);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(28, 43, 64, 0.96), rgba(10, 18, 32, 0.94)) !important;
    color: #f2f6ff;
  }
  .tp-importHeader,
  .tp-importFooter {
    border-color: rgba(255, 255, 255, 0.14);
  }
  .tp-importClose {
    background: rgba(10, 17, 28, 0.58);
    border-color: rgba(255, 255, 255, 0.22);
    color: rgba(244, 247, 248, 0.72);
  }
  .tp-importClose:hover {
    color: #f4f7f8;
    border-color: rgba(216, 199, 163, 0.62);
  }
  .tp-importTab {
    color: rgba(244, 247, 248, 0.58);
  }
  .tp-importTabActive {
    background: rgba(216, 199, 163, 0.15) !important;
    border-color: rgba(216, 199, 163, 0.56) !important;
    color: #e6d6b5 !important;
  }
  .tp-importTextarea {
    background: rgba(7, 13, 23, 0.56) !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    color: #f4f7f8 !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .tp-importTextarea:focus {
    border-color: rgba(216, 199, 163, 0.68) !important;
    box-shadow: 0 0 0 3px rgba(216, 199, 163, 0.13) !important;
  }
  .tp-importTextarea::placeholder {
    color: rgba(244, 247, 248, 0.38) !important;
  }
  .tp-importDrop {
    background: rgba(7, 13, 23, 0.50) !important;
    border-color: rgba(255, 255, 255, 0.20) !important;
    color: rgba(244, 247, 248, 0.72);
  }
  .tp-importDrop:hover {
    border-color: rgba(216, 199, 163, 0.64) !important;
  }
  .tp-importDropIcon { color: #e6d6b5; }
  .tp-importFileMeta {
    background: rgba(7, 13, 23, 0.50) !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    color: #f4f7f8;
  }
  .tp-importHint {
    color: rgba(244, 247, 248, 0.50);
  }
  .tp-importError {
    background:
      linear-gradient(90deg, rgba(255, 112, 112, 0.14), rgba(10, 15, 22, 0.70)) !important;
    border-color: rgba(255, 120, 120, 0.34) !important;
    color: #ffb3b3 !important;
  }
  .tp-importPrimary {
    border-color: transparent !important;
    background: #d8c7a3 !important;
    color: #08111f !important;
  }
  .tp-importPrimary:hover:not(:disabled) {
    background: #e6d6b5 !important;
    opacity: 1;
  }
  .tp-importPrimary:disabled {
    background: rgba(216, 199, 163, 0.42) !important;
    color: rgba(8, 17, 31, 0.72) !important;
  }
  @media (max-width: 640px) {
    .tp-importLayer { padding: 12px; }
    .tp-importModal { max-height: calc(100vh - 24px); }
    .tp-importTextarea { min-height: 170px; }
  }
`

function ImportArticleModal(props) {
  const { t, onClose, onImport } = props
  const [mode, setMode] = useState('paste')
  const [pasted, setPasted] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pasteRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onClose])

  useEffect(() => {
    if (mode === 'paste') pasteRef.current?.focus()
  }, [mode])

  function chooseFile(nextFile) {
    if (nextFile === null || nextFile === undefined) return
    try {
      validateImportFile(nextFile)
      setFile(nextFile)
      setError('')
    } catch (nextError) {
      setFile(null)
      setError(nextError?.message || t('importReadFailed'))
    }
  }

  function handleFileChange(event) {
    chooseFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    chooseFile(event.dataTransfer?.files?.[0])
  }

  async function handleSubmit() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      let raw
      let fallbackTitle
      if (mode === 'paste') {
        raw = pasted
        fallbackTitle = t('importPastedTitle')
      } else {
        if (file === null) throw new Error(t('importNoFile'))
        raw = await extractArticleFile(file)
        fallbackTitle = titleFromFile(file.name)
      }
      const structured = structureArticleText(raw, fallbackTitle)
      const text = assertArticleText(structured.text)
      onImport({ title: structured.title, text })
    } catch (nextError) {
      setError(nextError?.message || t('importReadFailed'))
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = !busy
    && (mode === 'paste' ? pasted.trim().length > 0 : file !== null)

  return h(
    'div',
    { className: 'tp-importLayer', onMouseUp: (event) => event.stopPropagation() },
    h('div', { className: 'tp-importBackdrop', onClick: busy ? undefined : onClose, 'aria-hidden': true }),
    h(
      'section',
      {
        className: 'tp-importModal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': t('importTitle'),
        onClick: (event) => event.stopPropagation(),
      },
      h('style', null, IMPORT_CSS),
      h(
        'header',
        { className: 'tp-importHeader' },
        h(
          'div',
          { className: 'tp-importHeading' },
          h('h2', { className: 'tp-importTitle' }, t('importTitle')),
          h('p', { className: 'tp-importSubtitle' }, t('importSubtitle')),
        ),
        h(
          'button',
          {
            className: 'tp-importClose',
            type: 'button',
            'aria-label': t('importClose'),
            title: t('importClose'),
            disabled: busy,
            onClick: onClose,
          },
          '×',
        ),
      ),
      h(
        'div',
        { className: 'tp-importTabs' },
        h(
          'button',
          {
            className: mode === 'paste' ? 'tp-importTab tp-importTabActive' : 'tp-importTab',
            type: 'button',
            onClick: () => { setMode('paste'); setError('') },
          },
          t('importPasteTab'),
        ),
        h(
          'button',
          {
            className: mode === 'upload' ? 'tp-importTab tp-importTabActive' : 'tp-importTab',
            type: 'button',
            onClick: () => { setMode('upload'); setError('') },
          },
          t('importUploadTab'),
        ),
      ),
      h(
        'div',
        { className: 'tp-importBody' },
        mode === 'paste'
          ? h(
              React.Fragment,
              null,
              h('label', { className: 'tp-importLabel', htmlFor: 'tp-import-text' }, t('importPasteLabel')),
              h('textarea', {
                id: 'tp-import-text',
                ref: pasteRef,
                className: 'tp-importTextarea',
                value: pasted,
                placeholder: t('importPastePlaceholder'),
                onChange: (event) => setPasted(event.target.value),
                spellCheck: false,
              }),
              h('div', { className: 'tp-importHint' }, t('importPasteHint')),
            )
          : h(
              React.Fragment,
              null,
              h(
                'div',
                {
                  className: 'tp-importDrop',
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => fileInputRef.current?.click(),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      fileInputRef.current?.click()
                    }
                  },
                  onDrop: handleDrop,
                  onDragOver: (event) => event.preventDefault(),
                },
                h('div', { className: 'tp-importDropIcon' }, '⇧'),
                h('div', { className: 'tp-importDropText' }, t('importChooseFile')),
                h('div', { className: 'tp-importDropHint' }, t('importFileHint')),
              ),
              h('input', {
                ref: fileInputRef,
                type: 'file',
                accept: '.txt,.docx',
                style: { display: 'none' },
                onChange: handleFileChange,
              }),
              file === null
                ? null
                : h(
                    'div',
                    { className: 'tp-importFileMeta' },
                    `${t('importSelectedFile')}：${file.name}`,
                  ),
              h('div', { className: 'tp-importHint' }, t('importDocxHint')),
            ),
        error.length === 0
          ? null
          : h('div', { className: 'tp-importError', role: 'alert' }, error),
      ),
      h(
        'footer',
        { className: 'tp-importFooter' },
        h(
          'button',
          { className: 'tp-btn', type: 'button', disabled: busy, onClick: onClose },
          t('importCancel'),
        ),
        h(
          'button',
          {
            className: 'tp-btn tp-importPrimary',
            type: 'button',
            disabled: !canSubmit,
            onClick: handleSubmit,
          },
          busy ? t('importBusy') : t('importStart'),
        ),
      ),
    ),
  )
}

module.exports = { ImportArticleModal }
