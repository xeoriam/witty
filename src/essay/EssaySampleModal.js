const { React, h, useEffect } = require('../shared.js')

const SAMPLE_CSS = `
  .tp-sampleLayer {
    position: fixed;
    inset: 0;
    z-index: 128;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 20px;
  }
  .tp-sampleBackdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 6, 14, 0.60);
    backdrop-filter: blur(4px);
  }
  .tp-sampleCard {
    position: relative;
    z-index: 1;
    width: min(900px, 96vw);
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 20px;
    background:
      linear-gradient(145deg, rgba(28, 43, 64, 0.97), rgba(9, 17, 30, 0.95));
    color: #f2f6ff;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.46);
  }
  .tp-sampleCard button {
    font: inherit;
  }
  .tp-sampleClose {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    width: 30px;
    height: 30px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 8px;
    background: rgba(10, 17, 28, 0.58);
    color: rgba(244, 247, 248, 0.72);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
  .tp-sampleClose:hover {
    color: #f4f7f8;
    border-color: rgba(216, 199, 163, 0.62);
  }
  .tp-sampleHead {
    flex: 0 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px 13px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  }
  .tp-sampleTitle {
    margin: 0;
    padding-right: 30px;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 650;
  }
  .tp-sampleMeta {
    margin: 5px 0 0;
    color: rgba(244, 247, 248, 0.58);
    font-size: 11.5px;
    line-height: 1.5;
  }
  .tp-sampleScroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 18px 24px 22px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .tp-sampleSection {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tp-sampleSectionTitle {
    margin: 0;
    color: #e6d6b5;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 650;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .tp-sampleParagraph {
    margin: 0;
    color: rgba(244, 247, 248, 0.90);
    font-size: 14.5px;
    line-height: 1.9;
  }
  .tp-sampleTranslation {
    margin: 0;
    color: rgba(244, 247, 248, 0.76);
    font-size: 13.5px;
    line-height: 1.9;
  }
  .tp-sampleHighlights {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tp-sampleHighlight {
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 10px;
    background: rgba(8, 14, 24, 0.42);
  }
  .tp-sampleHighlightKind {
    display: inline-flex;
    margin-bottom: 4px;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(216, 199, 163, 0.14);
    color: #e6d6b5;
    font-size: 10px;
    font-weight: 650;
    letter-spacing: .05em;
  }
  .tp-sampleHighlightText {
    margin: 0;
    color: #f4f7f8;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 550;
  }
  .tp-sampleHighlightExplanation {
    margin: 3px 0 0;
    color: rgba(244, 247, 248, 0.62);
    font-size: 12px;
    line-height: 1.6;
  }
  .tp-sampleLoading,
  .tp-sampleError {
    padding: 36px 12px;
    color: rgba(244, 247, 248, 0.62);
    font-size: 13px;
    line-height: 1.7;
    text-align: center;
  }
  .tp-sampleError { color: #ffb3b3; }
  .tp-sampleRetry {
    display: block;
    margin: 10px auto 0;
    border: none;
    background: transparent;
    color: #e6d6b5;
    font-size: 12px;
    cursor: pointer;
  }
  .tp-sampleFooter {
    flex: 0 0 auto;
    padding: 13px 24px 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
  }
  .tp-sampleImport {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: #d8c7a3;
    color: #08111f;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 100ms ease-out, background 180ms ease;
  }
  .tp-sampleImport:hover {
    background: #e6d6b5;
  }
  .tp-sampleImport:active {
    transform: scale(0.985);
  }
  .tp-sampleImport:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  @media (max-width: 620px) {
    .tp-sampleLayer { padding: 10px; }
    .tp-sampleCard { max-height: calc(100vh - 20px); }
    .tp-sampleHead { padding: 18px 16px 12px; }
    .tp-sampleScroll { padding: 14px 16px 18px; }
    .tp-sampleFooter { padding: 12px 16px 14px; }
  }
`

function sampleParagraphs(text) {
  return String(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function EssaySampleModal(props) {
  const { t, state, onClose, onRetry, onImport } = props

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const sample = state.status === 'ready' ? state.data : null
  const wordCount = sample === null
    ? 0
    : (sample.essay_text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? []).length

  function importSample() {
    if (sample === null) return
    const accepted = onImport(sample)
    if (accepted) onClose()
  }

  return h(
    'div',
    {
      className: 'tp-sampleLayer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': t('essaySampleTitle'),
      onClick: onClose,
    },
    h('div', { className: 'tp-sampleBackdrop', 'aria-hidden': true }),
    h(
      'section',
      {
        className: 'tp-sampleCard',
        onClick: (event) => event.stopPropagation(),
      },
      h('style', null, SAMPLE_CSS),
      h(
        'button',
        {
          className: 'tp-sampleClose',
          type: 'button',
          'aria-label': t('wordClose'),
          title: t('wordClose'),
          onClick: onClose,
        },
        '×',
      ),
      h(
        'header',
        { className: 'tp-sampleHead' },
        h(
          'div',
          null,
          h('h2', { className: 'tp-sampleTitle' }, t('essaySampleTitle')),
          sample === null
            ? null
            : h('p', { className: 'tp-sampleMeta' }, `${wordCount} ${t('essayWordUnit')} · 17–20 ${t('essaySampleBand')}`),
        ),
      ),
      state.status === 'loading'
        ? h('div', { className: 'tp-sampleLoading' }, t('essaySampleGenerating'))
        : state.status === 'error'
          ? h(
              'div',
              { className: 'tp-sampleError' },
              state.error?.message || t('essaySampleError'),
              h(
                'button',
                { className: 'tp-sampleRetry', type: 'button', onClick: onRetry },
                t('essaySampleRetry'),
              ),
            )
          : sample === null
            ? null
            : h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'tp-sampleScroll' },
                  h(
                    'section',
                    { className: 'tp-sampleSection' },
                    h('h3', { className: 'tp-sampleSectionTitle' }, t('essaySampleEnglish')),
                    sampleParagraphs(sample.essay_text).map((paragraph, index) => h(
                      'p',
                      { className: 'tp-sampleParagraph', key: index },
                      paragraph,
                    )),
                  ),
                  h(
                    'section',
                    { className: 'tp-sampleSection' },
                    h('h3', { className: 'tp-sampleSectionTitle' }, t('essaySampleTranslation')),
                    h('p', { className: 'tp-sampleTranslation' }, sample.translation),
                  ),
                  h(
                    'section',
                    { className: 'tp-sampleSection' },
                    h('h3', { className: 'tp-sampleSectionTitle' }, t('essaySampleHighlights')),
                    h(
                      'div',
                      { className: 'tp-sampleHighlights' },
                      sample.highlights.map((item, index) => h(
                        'div',
                        { className: 'tp-sampleHighlight', key: index },
                        h(
                          'span',
                          { className: 'tp-sampleHighlightKind' },
                          item.kind === 'vocabulary'
                            ? t('essaySampleVocabulary')
                            : t('essaySampleStructure'),
                        ),
                        h('p', { className: 'tp-sampleHighlightText' }, item.text),
                        h('p', { className: 'tp-sampleHighlightExplanation' }, item.explanation),
                      )),
                    ),
                  ),
                ),
                h(
                  'footer',
                  { className: 'tp-sampleFooter' },
                  h(
                    'button',
                    {
                      className: 'tp-sampleImport',
                      type: 'button',
                      onClick: importSample,
                    },
                    t('essaySampleImport'),
                  ),
                ),
              ),
    ),
  )
}

module.exports = { EssaySampleModal }
