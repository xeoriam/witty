const {
  React, h, useCallback, useEffect, useState,
  requestJson, useT,
} = require('../shared.js')

const ARCHIVE_CSS = `
  .tp-archive {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 2px 2px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .tp-archiveToolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .tp-archiveTitle {
    margin: 0;
    font-size: 17px;
    line-height: 1.4;
    font-weight: 650;
  }
  .tp-archiveSubtitle {
    margin: 3px 0 0;
    color: rgba(244, 247, 248, 0.55);
    font-size: 11.5px;
    line-height: 1.5;
  }
  .tp-archiveActions {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
  }
  .tp-archiveList {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tp-archiveItem {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
    padding: 11px 12px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 11px;
    background: rgba(8, 14, 24, 0.46);
    color: #f4f7f8;
    text-align: left;
    cursor: pointer;
  }
  .tp-archiveItem:hover {
    border-color: rgba(216, 199, 163, 0.52);
    background: rgba(216, 199, 163, 0.08);
  }
  .tp-archiveItemMain { min-width: 0; flex: 1 1 auto; }
  .tp-archiveItemTop {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
    color: rgba(244, 247, 248, 0.52);
    font-size: 10.5px;
  }
  .tp-archiveCategory {
    padding: 1px 7px;
    border: 1px solid rgba(216, 199, 163, 0.30);
    border-radius: 999px;
    color: #e6d6b5;
  }
  .tp-archiveTopic {
    margin: 5px 0 0;
    color: rgba(244, 247, 248, 0.82);
    font-size: 12.5px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tp-archiveScore {
    flex: 0 0 auto;
    color: #e6d6b5;
    font-size: 13px;
    font-weight: 650;
    white-space: nowrap;
  }
  .tp-archiveEmpty,
  .tp-archiveError,
  .tp-archiveLoading {
    padding: 34px 10px;
    color: rgba(244, 247, 248, 0.56);
    font-size: 12.5px;
    line-height: 1.7;
    text-align: center;
  }
  .tp-archiveError { color: #ffb3b3; }
  .tp-archiveDetail {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .tp-archiveDetailHead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
  .tp-archiveDetailTitle {
    margin: 0;
    font-size: 15px;
    line-height: 1.55;
    font-weight: 600;
  }
  .tp-archiveSection {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tp-archiveSectionTitle {
    margin: 0;
    color: #e6d6b5;
    font-size: 10.5px;
    line-height: 1.4;
    font-weight: 650;
    letter-spacing: .07em;
    text-transform: uppercase;
  }
  .tp-archiveDrawing {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    background: #ffffff;
    overflow: auto;
  }
  .tp-archiveDrawing svg {
    display: block;
    width: 100%;
    height: auto;
    max-height: 280px;
  }
  .tp-archiveEssay {
    margin: 0;
    padding: 9px 10px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 9px;
    background: rgba(8, 14, 24, 0.40);
    color: rgba(244, 247, 248, 0.82);
    font-size: 12.5px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .tp-archiveScoreGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }
  .tp-archiveScoreBox {
    padding: 8px 9px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 8px;
    background: rgba(8, 14, 24, 0.36);
  }
  .tp-archiveScoreLabel {
    display: block;
    color: rgba(244, 247, 248, 0.48);
    font-size: 10px;
  }
  .tp-archiveScoreValue {
    display: block;
    margin-top: 2px;
    color: #f4f7f8;
    font-size: 15px;
    font-weight: 650;
  }
  .tp-archiveFeedback {
    margin: 0;
    padding: 8px 9px;
    border-left: 2px solid rgba(216, 199, 163, 0.42);
    background: rgba(216, 199, 163, 0.06);
    color: rgba(244, 247, 248, 0.68);
    font-size: 11.5px;
    line-height: 1.7;
  }
  .tp-archiveHighlights {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tp-archiveHighlight {
    padding: 7px 9px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 8px;
    background: rgba(8, 14, 24, 0.36);
    color: rgba(244, 247, 248, 0.70);
    font-size: 11.5px;
    line-height: 1.6;
  }
  .tp-archiveHighlight strong {
    color: #e6d6b5;
    font-weight: 600;
  }
  .tp-archiveImport {
    align-self: flex-start;
    padding: 9px 14px;
    border: 1px solid transparent;
    border-radius: 9px;
    background: #d8c7a3;
    color: #08111f;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }
  .tp-archiveImport:disabled {
    opacity: .42;
    cursor: not-allowed;
  }
  @media (max-width: 620px) {
    .tp-archiveScoreGrid { grid-template-columns: 1fr; }
  }
`

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value ?? '')
  const pad = (input) => String(input).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function categoryLabel(category) {
  if (category === null || category === undefined) return ''
  if (typeof category === 'string') return category
  return category.label || category.id || ''
}

function isSafeArchiveSvg(value) {
  if (typeof value !== 'string') return false
  const svg = value.trim()
  return /^<svg[\s>]/i.test(svg)
    && /<\/svg>$/i.test(svg)
    && !/<script\b|\bon[a-z]+\s*=|javascript\s*:/i.test(svg)
}

function EssayArchiveView(props) {
  const { ctx, onImportSample } = props
  const t = useT(ctx)
  const [list, setList] = useState({ status: 'loading', items: [], error: null })
  const [selected, setSelected] = useState({ status: 'idle', item: null, error: null })
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setList((current) => ({ ...current, status: 'loading', error: null }))
    try {
      const data = await requestJson('/essay/archive')
      setList({
        status: 'ready',
        items: Array.isArray(data?.items) ? data.items : [],
        error: null,
      })
    } catch (error) {
      setList({ status: 'error', items: [], error: error?.message || t('essayArchiveError') })
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const openDetail = useCallback(async (item) => {
    setSelected({ status: 'loading', item: null, error: null })
    try {
      const data = await requestJson('/essay/archive/detail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      })
      setSelected({ status: 'ready', item: data?.item ?? null, error: null })
    } catch (error) {
      setSelected({ status: 'error', item: null, error: error?.message || t('essayArchiveError') })
    }
  }, [t])

  const exportAll = useCallback(async () => {
    setExporting(true)
    try {
      const data = await requestJson('/essay/archive/export')
      const blob = new Blob([JSON.stringify(data?.records ?? [], null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `essay-archive-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setList((current) => ({ ...current, error: error?.message || t('essayArchiveExportError') }))
    } finally {
      setExporting(false)
    }
  }, [t])

  function importSample(item) {
    if (typeof onImportSample !== 'function' || typeof item?.sample_essay !== 'string' || item.sample_essay.length === 0) {
      return
    }
    onImportSample({
      title: `${t('essayArchiveTypingTitle')} · ${categoryLabel(item.category)}`,
      text: item.sample_essay,
    })
  }

  if (selected.status !== 'idle') {
    const item = selected.item
    if (selected.status === 'loading') {
      return h('div', { className: 'tp-archive' }, h('div', { className: 'tp-archiveLoading' }, t('essayArchiveLoading')))
    }
    if (selected.status === 'error' || item === null) {
      return h(
        'div',
        { className: 'tp-archive' },
        h('div', { className: 'tp-alert' }, selected.error || t('essayArchiveError')),
        h('button', { className: 'tp-btn', type: 'button', onClick: () => setSelected({ status: 'idle', item: null, error: null }) }, t('essayArchiveBack')),
      )
    }
    const feedback = item.ai_feedback || {}
    const dimensions = feedback.dimensions || {}
    const paragraphs = Array.isArray(feedback.paragraph_feedback) ? feedback.paragraph_feedback : []
    return h(
      'div',
      { className: 'tp-archive' },
      h('style', null, ARCHIVE_CSS),
      h(
        'div',
        { className: 'tp-archiveActions' },
        h('button', { className: 'tp-btn', type: 'button', onClick: () => setSelected({ status: 'idle', item: null, error: null }) }, t('essayArchiveBack')),
      ),
      h(
        'div',
        { className: 'tp-archiveDetail' },
        h(
          'div',
          { className: 'tp-archiveDetailHead' },
          h(
            'div',
            null,
            h('div', { className: 'tp-archiveItemTop' }, formatDate(item.date), h('span', { className: 'tp-archiveCategory' }, categoryLabel(item.category))),
            h('h2', { className: 'tp-archiveDetailTitle' }, item.topic_prompt),
          ),
          h('span', { className: 'tp-archiveScore' }, feedback.total_score === undefined ? '—' : `${feedback.total_score} / 20`),
        ),
        isSafeArchiveSvg(item.drawing_svg)
          ? h(
              'section',
              { className: 'tp-archiveSection' },
              h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveDrawing')),
              h('div', {
                className: 'tp-archiveDrawing',
                dangerouslySetInnerHTML: { __html: item.drawing_svg },
              }),
            )
          : null,
        h(
          'section',
          { className: 'tp-archiveSection' },
          h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveUserEssay')),
          h('p', { className: 'tp-archiveEssay' }, item.user_essay),
        ),
        h(
          'section',
          { className: 'tp-archiveSection' },
          h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveFeedback')),
          h(
            'div',
            { className: 'tp-archiveScoreGrid' },
            [['content', t('essayDimensionContent')], ['structure', t('essayDimensionStructure')], ['language', t('essayDimensionLanguage')]].map(([key, label]) => h(
              'div',
              { className: 'tp-archiveScoreBox', key },
              h('span', { className: 'tp-archiveScoreLabel' }, label),
              h('span', { className: 'tp-archiveScoreValue' }, `${dimensions[key] ?? '—'} / 5`),
            )),
          ),
          paragraphs.map((paragraph, index) => h(
            'div',
            { key: index },
            h('p', { className: 'tp-archiveSectionTitle' }, `${t('essayParagraphPrefix')} ${paragraph.paragraph_index ?? index + 1}`),
            h('p', { className: 'tp-archiveFeedback' }, paragraph.paragraph_critique || ''),
            paragraph.rewritten_paragraph
              ? h('p', { className: 'tp-archiveEssay' }, paragraph.rewritten_paragraph)
              : null,
          )),
        ),
        h(
          'section',
          { className: 'tp-archiveSection' },
          h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveSample')),
          item.sample_essay
            ? h('p', { className: 'tp-archiveEssay' }, item.sample_essay)
            : h('p', { className: 'tp-archiveFeedback' }, t('essayArchiveNoSample')),
          item.sample_translation
            ? h('p', { className: 'tp-archiveFeedback' }, item.sample_translation)
            : null,
          Array.isArray(item.sample_highlights) && item.sample_highlights.length > 0
            ? h(
                'div',
                { className: 'tp-archiveHighlights' },
                item.sample_highlights.map((highlight, index) => h(
                  'div',
                  { className: 'tp-archiveHighlight', key: index },
                  h('strong', null, highlight.text || highlight.kind || ''),
                  ` ${highlight.explanation || ''}`,
                )),
              )
            : null,
          item.core_argument
            ? h('p', { className: 'tp-archiveSubtitle' }, `${t('essayArchiveCoreArgument')}：${item.core_argument}`)
            : null,
          item.sample_strategy
            ? h('p', { className: 'tp-archiveSubtitle' }, `${t('essayArchiveStrategy')}：${item.sample_strategy}`)
            : null,
          h(
            'button',
            {
              className: 'tp-archiveImport',
              type: 'button',
              disabled: typeof item.sample_essay !== 'string' || item.sample_essay.length === 0,
              onClick: () => importSample(item),
            },
            t('essayArchiveImport'),
          ),
        ),
      ),
    )
  }

  return h(
    'div',
    { className: 'tp-archive' },
    h('style', null, ARCHIVE_CSS),
    h(
      'div',
      { className: 'tp-archiveToolbar' },
      h(
        'div',
        null,
        h('h2', { className: 'tp-archiveTitle' }, t('essayArchiveTitle')),
        h('p', { className: 'tp-archiveSubtitle' }, t('essayArchiveSubtitle')),
      ),
      h(
        'div',
        { className: 'tp-archiveActions' },
        h('button', { className: 'tp-btn', type: 'button', onClick: () => { void load() } }, t('essayArchiveRefresh')),
        h('button', { className: 'tp-btn', type: 'button', disabled: exporting, onClick: () => { void exportAll() } }, exporting ? t('essayArchiveExporting') : t('essayArchiveExport')),
      ),
    ),
    list.status === 'error'
      ? h('div', { className: 'tp-archiveError' }, list.error)
      : list.status === 'loading' && list.items.length === 0
        ? h('div', { className: 'tp-archiveLoading' }, t('essayArchiveLoading'))
        : list.items.length === 0
          ? h('div', { className: 'tp-archiveEmpty' }, t('essayArchiveEmpty'))
          : h(
              'div',
              { className: 'tp-archiveList' },
              list.items.map((item) => h(
                'button',
                {
                  className: 'tp-archiveItem',
                  type: 'button',
                  key: item.id,
                  onClick: () => { void openDetail(item) },
                },
                h(
                  'div',
                  { className: 'tp-archiveItemMain' },
                  h(
                    'div',
                    { className: 'tp-archiveItemTop' },
                    formatDate(item.date),
                    h('span', { className: 'tp-archiveCategory' }, categoryLabel(item.category)),
                    item.sample_strategy ? h('span', null, item.sample_strategy) : null,
                  ),
                  h('p', { className: 'tp-archiveTopic' }, item.topic_prompt),
                ),
                h('span', { className: 'tp-archiveScore' }, item.score === null ? '—' : `${item.score} / 20`),
              )),
            ),
  )
}

module.exports = { EssayArchiveView }
