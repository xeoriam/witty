const { React, h, useEffect, useState } = require('../shared.js')

const READING_CSS = `
  .tp-readingLayer {
    position: fixed;
    inset: 0;
    z-index: 127;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 20px;
  }
  .tp-readingBackdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 6, 14, 0.60);
    backdrop-filter: blur(4px);
  }
  .tp-readingCard {
    position: relative;
    z-index: 1;
    width: min(880px, 96vw);
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
  .tp-readingCard button { font: inherit; }
  .tp-readingClose {
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
  .tp-readingClose:hover {
    color: #f4f7f8;
    border-color: rgba(216, 199, 163, 0.62);
  }
  .tp-readingHead {
    flex: 0 0 auto;
    padding: 20px 24px 13px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  }
  .tp-readingTitle {
    margin: 0;
    padding-right: 30px;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 650;
  }
  .tp-readingMeta {
    margin: 5px 0 0;
    color: rgba(244, 247, 248, 0.58);
    font-size: 11.5px;
    line-height: 1.5;
  }
  .tp-readingScroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 18px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .tp-readingSection {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tp-readingSectionTitle {
    margin: 0;
    color: #e6d6b5;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 650;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .tp-readingTopics {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .tp-readingTopic {
    padding: 4px 9px;
    border: 1px solid rgba(216, 199, 163, 0.28);
    border-radius: 999px;
    background: rgba(216, 199, 163, 0.10);
    color: #e6d6b5;
    font-size: 11px;
    line-height: 1.5;
  }
  .tp-readingVocab {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .tp-readingVocabItem {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 10px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 10px;
    background: rgba(8, 14, 24, 0.42);
  }
  .tp-readingVocabMain {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .tp-readingVocabWord {
    margin: 0;
    color: #f4f7f8;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
  }
  .tp-readingVocabPos {
    margin-left: 6px;
    color: #e6d6b5;
    font-size: 10.5px;
    font-style: italic;
    font-weight: 400;
  }
  .tp-readingVocabMeaning {
    margin: 0;
    color: rgba(244, 247, 248, 0.66);
    font-size: 12px;
    line-height: 1.55;
  }
  .tp-readingWriting {
    align-self: flex-start;
    margin-top: 2px;
    padding: 1px 7px;
    border: 1px solid rgba(216, 199, 163, 0.42);
    border-radius: 999px;
    color: #e6d6b5;
    font-size: 9.5px;
    line-height: 1.5;
  }
  .tp-readingSave {
    flex: 0 0 auto;
    padding: 4px 9px;
    border: 1px solid rgba(216, 199, 163, 0.38);
    border-radius: 999px;
    background: rgba(8, 14, 24, 0.44);
    color: #e6d6b5;
    font-size: 10.5px;
    cursor: pointer;
  }
  .tp-readingSave:hover:not(:disabled) {
    background: rgba(216, 199, 163, 0.10);
    border-color: rgba(216, 199, 163, 0.68);
  }
  .tp-readingSave:disabled { opacity: .45; cursor: default; }
  .tp-readingSentence {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 11px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 10px;
    background: rgba(8, 14, 24, 0.42);
  }
  .tp-readingSentenceText {
    margin: 0;
    color: #f4f7f8;
    font-size: 13.5px;
    line-height: 1.7;
  }
  .tp-readingAnalysis {
    margin: 0;
    color: rgba(244, 247, 248, 0.64);
    font-size: 11.5px;
    line-height: 1.65;
  }
  .tp-readingPhrases {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .tp-readingPhrase {
    padding: 2px 7px;
    border-radius: 7px;
    background: rgba(216, 199, 163, 0.08);
    color: rgba(244, 247, 248, 0.72);
    font-size: 10.5px;
    line-height: 1.5;
  }
  .tp-readingPhrase strong { color: #e6d6b5; font-weight: 550; }
  .tp-readingLoading,
  .tp-readingError {
    padding: 44px 12px;
    text-align: center;
    color: rgba(244, 247, 248, 0.62);
    font-size: 13px;
    line-height: 1.7;
  }
  .tp-readingError { color: #ffb3b3; }
  .tp-readingRetry {
    display: block;
    margin: 10px auto 0;
    border: none;
    background: transparent;
    color: #e6d6b5;
    font-size: 12px;
    cursor: pointer;
  }
  @media (max-width: 620px) {
    .tp-readingLayer { padding: 10px; }
    .tp-readingHead { padding: 18px 16px 12px; }
    .tp-readingScroll { padding: 14px 16px 18px; }
  }
`

function ReadingAnalysisModal(props) {
  const { t, state, onClose, onRetry, onSaveVocabulary, onSaveSentence } = props
  const [savingKey, setSavingKey] = useState(null)
  const [savedKeys, setSavedKeys] = useState([])
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const analysis = state.status === 'ready' ? state.data : null

  async function save(kind, item, index) {
    if (typeof onSaveVocabulary !== 'function' && kind === 'vocabulary') return
    if (typeof onSaveSentence !== 'function' && kind === 'sentence') return
    const key = `${kind}-${index}`
    if (savedKeys.includes(key)) return
    setSavingKey(key)
    setSaveError('')
    try {
      if (kind === 'vocabulary') await onSaveVocabulary(item)
      else await onSaveSentence(item)
      setSavedKeys((current) => current.concat(key))
    } catch (error) {
      setSaveError(error?.message || t('readingSaveFailed'))
    } finally {
      setSavingKey(null)
    }
  }

  return h(
    'div',
    {
      className: 'tp-readingLayer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': t('readingTitle'),
      onClick: onClose,
    },
    h('div', { className: 'tp-readingBackdrop', 'aria-hidden': true }),
    h(
      'section',
      {
        className: 'tp-readingCard',
        onClick: (event) => event.stopPropagation(),
      },
      h('style', null, READING_CSS),
      h(
        'button',
        {
          className: 'tp-readingClose',
          type: 'button',
          'aria-label': t('wordClose'),
          title: t('wordClose'),
          onClick: onClose,
        },
        '×',
      ),
      h(
        'header',
        { className: 'tp-readingHead' },
        h('h2', { className: 'tp-readingTitle' }, t('readingTitle')),
        h('p', { className: 'tp-readingMeta' }, t('readingMeta')),
      ),
      saveError.length > 0
        ? h('div', { className: 'tp-readingError' }, saveError)
        : null,
      state.status === 'loading'
        ? h('div', { className: 'tp-readingLoading' }, t('readingLoading'))
        : state.status === 'error'
          ? h(
              'div',
              { className: 'tp-readingError' },
              state.error?.message || t('readingError'),
              h(
                'button',
                { className: 'tp-readingRetry', type: 'button', onClick: onRetry },
                t('readingRetry'),
              ),
            )
          : analysis === null
            ? null
            : h(
                'div',
                { className: 'tp-readingScroll' },
                h(
                  'section',
                  { className: 'tp-readingSection' },
                  h('h3', { className: 'tp-readingSectionTitle' }, t('readingTopics')),
                  h(
                    'div',
                    { className: 'tp-readingTopics' },
                    analysis.topics.map((topic) => h(
                      'span',
                      {
                        className: 'tp-readingTopic',
                        key: `${topic.category}/${topic.subcategory}`,
                      },
                      `${topic.category} / ${topic.subcategory}`,
                    )),
                  ),
                ),
                h(
                  'section',
                  { className: 'tp-readingSection' },
                  h('h3', { className: 'tp-readingSectionTitle' }, t('readingVocabulary')),
                  h(
                    'div',
                    { className: 'tp-readingVocab' },
                    analysis.vocabulary.map((item, index) => {
                      const key = `vocabulary-${index}`
                      return h(
                        'div',
                        { className: 'tp-readingVocabItem', key },
                        h(
                          'div',
                          { className: 'tp-readingVocabMain' },
                          h(
                            'p',
                            { className: 'tp-readingVocabWord' },
                            item.word,
                            h('span', { className: 'tp-readingVocabPos' }, item.pos),
                          ),
                          h('p', { className: 'tp-readingVocabMeaning' }, item.meaning),
                          item.is_writing_vocab
                            ? h('span', { className: 'tp-readingWriting' }, t('readingWritingVocab'))
                            : null,
                        ),
                        h(
                          'button',
                          {
                            className: 'tp-readingSave',
                            type: 'button',
                            disabled: savingKey === key || savedKeys.includes(key),
                            onClick: () => { void save('vocabulary', item, index) },
                          },
                          savedKeys.includes(key) ? t('readingSaved') : t('readingSave'),
                        ),
                      )
                    }),
                  ),
                ),
                h(
                  'section',
                  { className: 'tp-readingSection' },
                  h('h3', { className: 'tp-readingSectionTitle' }, t('readingSentences')),
                  analysis.good_sentences.map((item, index) => {
                    const key = `sentence-${index}`
                    return h(
                      'article',
                      { className: 'tp-readingSentence', key },
                      h('p', { className: 'tp-readingSentenceText' }, item.sentence),
                      h('p', { className: 'tp-readingAnalysis' }, item.analysis),
                      h(
                        'div',
                        { className: 'tp-readingPhrases' },
                        item.embedded_phrases.map((phrase, phraseIndex) => h(
                          'span',
                          { className: 'tp-readingPhrase', key: phraseIndex },
                          h('strong', null, phrase.phrase),
                          ` ${phrase.meaning}`,
                        )),
                      ),
                      h(
                        'button',
                        {
                          className: 'tp-readingSave',
                          type: 'button',
                          disabled: savingKey === key || savedKeys.includes(key),
                          onClick: () => { void save('sentence', item, index) },
                        },
                        savedKeys.includes(key) ? t('readingSaved') : t('readingSave'),
                      ),
                    )
                  }),
                ),
              ),
    ),
  )
}

module.exports = { ReadingAnalysisModal }
