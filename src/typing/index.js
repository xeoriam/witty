const {
  React, h, useCallback, useEffect, useMemo, useRef, useState,
  requestJson, useT,
} = require('../shared.js')
const { QuizDrawer, assertQuizPayload } = require('./quiz.js')
const { FavoriteButton, SelectionChip } = require('./favorite-actions.js')
const { ImportArticleModal } = require('./ImportArticleModal.js')
const { WordModal } = require('./WordModal.js')
const { ReadingAnalysisModal } = require('./ReadingAnalysisModal.js')
const { preconnectDictionaryOrigins, prewarmDictionarySession } = require('./dictionary-session.js')
const { tokenizeSentence, wordCacheKey } = require('./word-lookup.js')

    const DEFAULT_ARTICLE = {
      title: 'The Quiet Power of Practice',
      text: [
        'Practice is not a single heroic effort, but a habit built from small, repeated choices.',
        'When you type an English sentence slowly and correctly, your fingers begin to remember the shape of the language.',
        'Mistakes are useful because they show exactly where your attention needs to go.',
        'A short session every day is more valuable than a long session once a month.',
        'The goal is not speed at first, but accuracy and confidence.',
        'With patience, the awkward pauses disappear and the words begin to flow.',
      ].join(' '),
    }
    function splitSentences(text) {
      const normalized = String(text).replace(/\s+/g, ' ').trim()
      if (normalized.length === 0) return []
      try {
        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
          const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
          return Array.from(segmenter.segment(normalized), (part) => part.segment.trim()).filter(Boolean)
        }
      } catch {
        // Fall through to the simple splitter.
      }
      return (normalized.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [normalized])
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    }
    function normalizeReadingTopic(value) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const category = typeof value.category === 'string' ? value.category.trim() : ''
        const subcategory = typeof value.subcategory === 'string' ? value.subcategory.trim() : ''
        return category.length > 0 && subcategory.length > 0
          ? { category, subcategory }
          : null
      }
      const parts = String(value ?? '').split('/').map((part) => part.trim()).filter(Boolean)
      if (parts.length === 0) return null
      return parts.length === 1
        ? { category: '社会热点', subcategory: parts[0] }
        : { category: parts[0], subcategory: parts.slice(1).join('/') }
    }

    function assertReadingPayload(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('精读数据不是对象。')
      }
      if (!Array.isArray(value.topics) || value.topics.length < 3 || value.topics.length > 6) {
        throw new Error('精读标签必须是 3–6 个。')
      }
      if (!Array.isArray(value.vocabulary) || value.vocabulary.length > 5) {
        throw new Error('重点词汇不能超过 5 个。')
      }
      const vocabulary = value.vocabulary.map((item) => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error('词汇条目无效。')
        }
        const word = typeof item.word === 'string' ? item.word.trim() : ''
        const pos = typeof item.pos === 'string' ? item.pos.trim() : ''
        const meaning = typeof item.meaning === 'string' ? item.meaning.trim() : ''
        if (word.length === 0 || pos.length === 0 || meaning.length === 0) {
          throw new Error('词汇条目缺少单词、词性或释义。')
        }
        return {
          word,
          pos,
          meaning,
          is_writing_vocab: item.is_writing_vocab === true,
        }
      })
      if (!Array.isArray(value.good_sentences) || value.good_sentences.length < 1 || value.good_sentences.length > 3) {
        throw new Error('好句必须是 1–3 句。')
      }
      const goodSentences = value.good_sentences.map((item) => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error('好句条目无效。')
        }
        const sentence = typeof item.sentence === 'string' ? item.sentence.trim() : ''
        const analysis = typeof item.analysis === 'string' ? item.analysis.trim() : ''
        if (sentence.length === 0 || analysis.length === 0) {
          throw new Error('好句缺少句子或解析。')
        }
        if (!Array.isArray(item.embedded_phrases) || item.embedded_phrases.length === 0) {
          throw new Error('好句缺少内嵌短语。')
        }
        const embeddedPhrases = item.embedded_phrases.map((phrase) => {
          const text = typeof phrase?.phrase === 'string' ? phrase.phrase.trim() : ''
          const meaning = typeof phrase?.meaning === 'string' ? phrase.meaning.trim() : ''
          if (text.length === 0 || meaning.length === 0) throw new Error('内嵌短语无效。')
          return { phrase: text, meaning }
        })
        return { sentence, analysis, embedded_phrases: embeddedPhrases }
      })
      const seenTopics = new Set()
      const topics = []
      for (const raw of value.topics) {
        const topic = normalizeReadingTopic(raw)
        if (topic === null) continue
        const key = `${topic.category}\u0000${topic.subcategory}`
        if (seenTopics.has(key)) continue
        seenTopics.add(key)
        topics.push(topic)
      }
      if (topics.length < 3 || topics.length > 6) {
        throw new Error('精读标签必须是 3–6 个。')
      }
      return { topics, vocabulary, good_sentences: goodSentences }
    }

    function sourceSentenceFor(text, word) {
      const sentences = splitSentences(text)
      const target = String(word).toLowerCase()
      const found = sentences.find((sentence) => sentence.toLowerCase().includes(target))
      return found ?? ''
    }

    function countErrors(target, typed) {
      const expected = Array.from(target)
      const actual = Array.from(typed)
      let count = 0
      for (let index = 0; index < Math.min(expected.length, actual.length); index += 1) {
        if (expected[index] !== actual[index]) count += 1
      }
      if (actual.length > expected.length) count += actual.length - expected.length
      return count
    }
    function SentenceText(props) {
      const { text, typed, active, sentence, onWordClick } = props
      const actual = active ? Array.from(typed ?? '') : []
      const tokens = tokenizeSentence(text)

      const renderCharacters = (value, start) => Array.from(value).map((character, offset) => {
        const index = start + offset
        const wrong = active && index < actual.length && actual[index] !== character
        return h(
          'span',
          {
            key: `c${index}`,
            className: wrong ? 'tp-char tp-charError' : 'tp-char',
          },
          character,
        )
      })

      return h(
        React.Fragment,
        null,
        tokens.map((token, index) => {
          if (token.type === 'text') {
            return h(
              React.Fragment,
              { key: `t${index}` },
              renderCharacters(token.value, token.start),
            )
          }
          return h(
            'span',
            {
              key: `w${index}`,
              className: 'tp-word',
              onClick: (event) => {
                const selection = window.getSelection()
                if (selection !== null && !selection.isCollapsed) return
                event.stopPropagation()
                if (typeof onWordClick === 'function') {
                  onWordClick(token.value, sentence, event)
                }
              },
            },
            renderCharacters(token.value, token.start),
          )
        }),
      )
    }
    function EngineBadge(props) {
      const { engine, t } = props
      if (engine.state === 'ready') {
        return h(
          'div',
          { className: 'tp-engine', title: `${engine.provider.id} / ${engine.model}` },
          h('span', { className: 'tp-dot tp-dot-ok' }),
          h(
            'span',
            { className: 'tp-engineText' },
            h('strong', null, engine.provider.name || 'DeepSeek'),
            h('span', { className: 'tp-engineMeta' }, `${engine.provider.id} / ${engine.model}`),
          ),
        )
      }

      const failed = engine.state === 'error'
      return h(
        'div',
        { className: 'tp-engine', title: failed ? engine.message : '' },
        h('span', { className: failed ? 'tp-dot tp-dot-error' : 'tp-dot tp-dot-pending' }),
        h('span', { className: 'tp-engineText' }, failed ? t('engineErrorShort') : t('engineChecking')),
      )
    }
    function TranslationCard(props) {
      const { record, t, onRetry } = props
      if (record === null) {
        return h('p', { className: 'tp-placeholder' }, t('translationPlaceholder'))
      }

      return h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'tp-recordHead' },
          h('span', { className: 'tp-chip' }, `${t('sentenceLabel')} ${record.index + 1}`),
          record.status === 'pending'
            ? h('span', { className: 'tp-recordStatus' }, t('translating'))
            : null,
          record.status === 'done'
            ? h(FavoriteButton, {
                saved: props.saved,
                busy: props.busy,
                t,
                onCollect: () => props.onCollect(record),
              })
            : null,
        ),
        h('p', { className: 'tp-enSmall' }, record.en),
        record.status === 'pending'
          ? h('div', { className: 'tp-pending' }, t('translating'))
          : record.status === 'error'
            ? h(
                'div',
                { className: 'tp-alert' },
                h(
                  'div',
                  { className: 'tp-alertText' },
                  h('div', null, record.error?.message || t('translationFailed')),
                  record.error?.code ? h('div', { className: 'tp-alertHint' }, record.error.code) : null,
                ),
                h(
                  'button',
                  { className: 'tp-btn', type: 'button', onClick: () => onRetry(record) },
                  t('retry'),
                ),
              )
            : h('p', { className: 'tp-zh' }, record.zh),
        record.status === 'done' && record.provider
          ? h(
              'div',
              { className: 'tp-providerLine' },
              `${record.provider.name || 'DeepSeek'} · ${record.provider.id} / ${record.model}`,
            )
          : null,
      )
    }
    function RecordRow(props) {
      const { record, t, onRetry } = props
      return h(
        'article',
        { className: 'tp-record' },
        h(
          'div',
          { className: 'tp-recordHead' },
          h('span', { className: 'tp-recordIndex' }, String(record.index + 1).padStart(2, '0')),
          record.status === 'pending'
            ? h('span', { className: 'tp-recordStatus' }, t('translating'))
            : record.status === 'error'
              ? h('span', { className: 'tp-recordStatus' }, t('failed'))
              : null,
          record.status === 'done'
            ? h(FavoriteButton, {
                saved: props.saved,
                busy: props.busy,
                t,
                onCollect: () => props.onCollect(record),
              })
            : null,
        ),
        h('p', { className: 'tp-recordEn' }, record.en),
        record.status === 'pending'
          ? h('p', { className: 'tp-recordZh tp-muted' }, t('translating'))
          : record.status === 'error'
            ? h(
                'div',
                { className: 'tp-recordError' },
                h('span', null, record.error?.message || t('translationFailed')),
                h(
                  'button',
                  { className: 'tp-btn tp-btnSmall', type: 'button', onClick: () => onRetry(record) },
                  t('retry'),
                ),
              )
            : h('p', { className: 'tp-recordZh' }, record.zh),
      )
    }
    function PracticeView(props) {
      const {
        ctx,
        embedded = false,
        onFavoriteSaved,
        pendingArticle,
        onPendingArticleConsumed,
        onPracticeStateChange,
      } = props
      const t = useT(ctx)
      const [article, setArticle] = useState(DEFAULT_ARTICLE)
      const paragraphs = useMemo(() => (
        String(article.text)
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
      ), [article.text])
      const sentenceGroups = useMemo(() => {
        let start = 0
        return paragraphs.map((paragraph) => {
          const items = splitSentences(paragraph)
          const group = { start, items }
          start += items.length
          return group
        })
      }, [paragraphs])
      const sentences = useMemo(
        () => sentenceGroups.flatMap((group) => group.items),
        [sentenceGroups],
      )
      const [importOpen, setImportOpen] = useState(false)
      const total = sentences.length
      const [index, setIndex] = useState(0)
      const [typed, setTyped] = useState('')
      const [records, setRecords] = useState([])
      const [hint, setHint] = useState('')
      const [engine, setEngine] = useState({ state: 'checking' })
      const inputRef = useRef(null)
      const listRef = useRef(null)
      const controllersRef = useRef(new Map())
      const lastCommittedRef = useRef(-1)
      const rootRef = useRef(null)
      const [savedKeys, setSavedKeys] = useState({})
      const [savingKeys, setSavingKeys] = useState({})
      const [toast, setToast] = useState(null)
      const [floatMenu, setFloatMenu] = useState(null)
      const [quizOpen, setQuizOpen] = useState(false)
      const [quiz, setQuiz] = useState({
        status: 'idle',
        questions: [],
        error: null,
        provider: null,
        model: null,
        attempts: 0,
      })
      const [answers, setAnswers] = useState({})
      const [submitted, setSubmitted] = useState(false)
      const quizAbortRef = useRef(null)
      const [reading, setReading] = useState({
        status: 'idle',
        data: null,
        error: null,
      })
      const [readingOpen, setReadingOpen] = useState(false)
      const readingAbortRef = useRef(null)
      const [wordPopover, setWordPopover] = useState(null)
      const wordCacheRef = useRef(new Map())
      const wordAbortRef = useRef(new Map())
      const wordCloseTimerRef = useRef(null)
      const wordInputSelectionRef = useRef(null)
      const savedWordKeysRef = useRef(new Set())

      const done = index >= total
      const sentence = done ? '' : sentences[index]
      const latestRecord = records.length > 0 ? records[records.length - 1] : null
      const errors = done ? 0 : countErrors(sentence, typed)
      const extra = done ? 0 : Math.max(0, Array.from(typed).length - Array.from(sentence).length)
      const exact = !done && typed.trimEnd() === sentence
      const progress = total === 0 ? 0 : Math.round((records.length / total) * 100)

      const collect = useCallback(async (payload, key) => {
        if (key !== undefined && savedKeys[key] === true) return
        if (key !== undefined) setSavingKeys((current) => ({ ...current, [key]: true }))
        try {
          await requestJson('/favorites', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (key !== undefined) setSavedKeys((current) => ({ ...current, [key]: true }))
          setToast({ tone: 'ok', text: t('favoriteToastSaved') })
          if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
        } catch (error) {
          const duplicate = error?.code === 'DUPLICATE_VOCABULARY'
            || error?.code === 'DUPLICATE_SENTENCE'
          setToast({
            tone: duplicate ? 'info' : 'error',
            text: duplicate
              ? (error?.message || t('favoriteToastDuplicate'))
              : `${t('favoriteToastFailed')}${error?.message ?? ''}`,
          })
        } finally {
          if (key !== undefined) {
            setSavingKeys((current) => {
              const next = { ...current }
              delete next[key]
              return next
            })
          }
        }
      }, [savedKeys, t])

      useEffect(() => {
        if (toast === null) return undefined
        const timer = window.setTimeout(() => setToast(null), 2400)
        return () => window.clearTimeout(timer)
      }, [toast])

      const collectSentence = useCallback((record) => {
        void collect({
          type: 'sentence',
          text: record.en,
          translation: typeof record.zh === 'string' ? record.zh : '',
          source: article.title,
        }, `s${record.index}`)
      }, [collect])

      const handleRootMouseUp = useCallback((event) => {
        const target = event?.target
        if (target instanceof Element && target.closest('.tp-favFloat') !== null) return
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          setFloatMenu(null)
          return
        }
        const text = selection.toString().trim()
        if (text.length === 0) {
          setFloatMenu(null)
          return
        }
        const range = selection.getRangeAt(0)
        const root = rootRef.current
        if (root === null || !root.contains(range.commonAncestorContainer)) {
          setFloatMenu(null)
          return
        }
        const rect = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) {
          setFloatMenu(null)
          return
        }
        setFloatMenu({
          mode: 'chip',
          text: text.slice(0, 4000),
          x: rect.left + rect.width / 2,
          y: rect.top,
        })
      }, [])

      const pickFavoriteType = useCallback((type) => {
        const menu = floatMenu
        setFloatMenu(null)
        if (menu === null) return
        window.getSelection()?.removeAllRanges()
        void collect({
          type,
          text: menu.text,
          translation: '',
          source: `${article.title} · ${t('favoriteSelectionSource')}`,
        }, undefined)
      }, [collect, floatMenu, t])

      useEffect(() => {
        let alive = true
        const controller = new AbortController()
        requestJson('/status', { method: 'GET', signal: controller.signal })
          .then((data) => {
            if (!alive) return
            if (data?.ok) {
              setEngine({ state: 'ready', provider: data.provider, model: data.model })
            } else {
              setEngine({
                state: 'error',
                message: data?.error?.message || t('engineError'),
              })
            }
          })
          .catch((error) => {
            if (!alive || error?.name === 'AbortError') return
            setEngine({ state: 'error', message: error?.message || t('engineError') })
          })
        return () => {
          alive = false
          controller.abort()
        }
      }, [t])

      useEffect(() => {
        if (!done) inputRef.current?.focus()
      }, [index, done])

      useEffect(() => {
        const list = listRef.current
        if (list !== null) list.scrollTop = list.scrollHeight
      }, [records])

      useEffect(() => {
        preconnectDictionaryOrigins()
        void prewarmDictionarySession()
        return () => {
          for (const controller of controllersRef.current.values()) controller.abort()
          controllersRef.current.clear()
          if (quizAbortRef.current !== null) quizAbortRef.current.abort()
          if (readingAbortRef.current !== null) readingAbortRef.current.abort()
          for (const controller of wordAbortRef.current.values()) controller.abort()
          wordAbortRef.current.clear()
          if (wordCloseTimerRef.current !== null) {
            window.clearTimeout(wordCloseTimerRef.current)
            wordCloseTimerRef.current = null
          }
        }
      }, [])

      useEffect(() => {
        if (pendingArticle === null || pendingArticle === undefined) return
        applyImportedArticle({
          title: pendingArticle.title,
          text: pendingArticle.text,
        })
        if (typeof onPendingArticleConsumed === 'function') {
          onPendingArticleConsumed(pendingArticle.id)
        }
      }, [pendingArticle?.id])

      const hasTypingPractice = typed.trim().length > 0
        || index > 0
        || records.length > 0
        || article.text !== DEFAULT_ARTICLE.text
        || article.title !== DEFAULT_ARTICLE.title

      useEffect(() => {
        if (typeof onPracticeStateChange === 'function') {
          onPracticeStateChange(hasTypingPractice)
        }
      }, [hasTypingPractice, onPracticeStateChange])

      const runTranslation = useCallback(async (record) => {
        const previous = controllersRef.current.get(record.index)
        if (previous !== undefined) previous.abort()
        const controller = new AbortController()
        controllersRef.current.set(record.index, controller)

        setRecords((current) => current.map((item) => (
          item.index === record.index
            ? { ...item, status: 'pending', zh: '', error: null }
            : item
        )))

        try {
          const data = await requestJson('/translate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sentence: record.en }),
            signal: controller.signal,
          })
          if (controller.signal.aborted) return
          setRecords((current) => current.map((item) => (
            item.index === record.index
              ? {
                  ...item,
                  status: 'done',
                  zh: data.translation,
                  provider: data.provider,
                  model: data.model,
                  error: null,
                }
              : item
          )))
          if (data?.provider && data?.model) {
            setEngine({ state: 'ready', provider: data.provider, model: data.model })
          }
        } catch (error) {
          if (controller.signal.aborted || error?.name === 'AbortError') return
          setRecords((current) => current.map((item) => (
            item.index === record.index
              ? {
                  ...item,
                  status: 'error',
                  zh: '',
                  error: {
                    code: error?.code || 'TRANSLATION_FAILED',
                    message: error?.message || t('translationFailed'),
                  },
                }
              : item
          )))
        } finally {
          if (controllersRef.current.get(record.index) === controller) {
            controllersRef.current.delete(record.index)
          }
        }
      }, [t])

      function restoreInputFocus(force = false) {
        const input = inputRef.current
        if (input === null) return
        const active = document.activeElement
        if (!force && active !== null && active !== document.body && active !== input) return
        input.focus()
        const selection = wordInputSelectionRef.current
        if (selection !== null) {
          const max = input.value.length
          input.setSelectionRange(
            Math.min(selection.start, max),
            Math.min(selection.end, max),
          )
        }
      }

      function dismissWordLookup(restoreFocus = false) {
        for (const [key, controller] of wordAbortRef.current.entries()) {
          controller.abort()
          wordCacheRef.current.delete(key)
        }
        wordAbortRef.current.clear()
        if (wordCloseTimerRef.current !== null) {
          window.clearTimeout(wordCloseTimerRef.current)
          wordCloseTimerRef.current = null
        }
        setWordPopover(null)
        if (restoreFocus) window.setTimeout(() => restoreInputFocus(true), 0)
      }

      function openWordPopover(word, sentence, anchor, inputRect) {
        if (wordCloseTimerRef.current !== null) {
          window.clearTimeout(wordCloseTimerRef.current)
          wordCloseTimerRef.current = null
        }
        const key = wordCacheKey(word)
        const cached = wordCacheRef.current.get(key)
        if (cached !== undefined) {
          setWordPopover({
            key,
            word,
            sentence,
            anchor,
            inputRect,
            status: cached.status,
            meaning: cached.meaning || '',
            definition: cached.definition || '',
            collocations: cached.collocations || [],
            etymology: cached.etymology || '',
            phonetic: cached.phonetic || '',
            error: cached.error || null,
            saving: false,
            saved: savedWordKeysRef.current.has(key),
            saveError: null,
          })
          return
        }

        const controller = new AbortController()
        const entry = {
          status: 'loading',
          meaning: '',
          definition: '',
          collocations: [],
          etymology: '',
          phonetic: '',
          error: null,
        }
        wordCacheRef.current.set(key, entry)
        wordAbortRef.current.set(key, controller)
        setWordPopover({
          key,
          word,
          sentence,
          anchor,
          inputRect,
          status: 'loading',
          meaning: '',
          definition: '',
          collocations: [],
          etymology: '',
          phonetic: '',
          error: null,
          saving: false,
          saved: savedWordKeysRef.current.has(key),
          saveError: null,
        })

        void (async () => {
          try {
            const data = await requestJson('/word', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ word, sentence }),
              signal: controller.signal,
            })
            if (controller.signal.aborted) return
            const meaning = typeof data?.meaning === 'string' ? data.meaning.trim() : ''
            if (meaning.length === 0) throw new Error(t('wordNoMeaning'))
            const definition = typeof data?.definition === 'string' ? data.definition.trim() : ''
            const collocations = Array.isArray(data?.collocations)
              ? data.collocations.filter((item) => typeof item === 'string' && item.trim().length > 0)
              : []
            const etymology = typeof data?.etymology === 'string' ? data.etymology.trim() : ''
            const phonetic = typeof data?.phonetic === 'string' ? data.phonetic.trim() : ''
            entry.status = 'ready'
            entry.meaning = meaning
            entry.definition = definition
            entry.collocations = collocations
            entry.etymology = etymology
            entry.phonetic = phonetic
            setWordPopover((current) => (
              current !== null && current.key === key
                ? {
                    ...current,
                    status: 'ready',
                    meaning,
                    definition,
                    collocations,
                    etymology,
                    phonetic,
                    error: null,
                  }
                : current
            ))
          } catch (error) {
            if (controller.signal.aborted) return
            const message = error?.message || t('wordLookupFailed')
            entry.status = 'error'
            entry.error = message
            setWordPopover((current) => (
              current !== null && current.key === key
                ? { ...current, status: 'error', error: message }
                : current
            ))
          } finally {
            if (wordAbortRef.current.get(key) === controller) {
              wordAbortRef.current.delete(key)
            }
          }
        })()
      }

      function handleWordClick(word, sentence, event) {
        const selection = window.getSelection()
        if (selection !== null && !selection.isCollapsed) return
        event.stopPropagation()
        const input = inputRef.current
        if (input !== null) {
          wordInputSelectionRef.current = {
            start: input.selectionStart,
            end: input.selectionEnd,
          }
          input.blur()
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const inputRect = input === null ? null : input.getBoundingClientRect()
        openWordPopover(
          word,
          sentence,
          { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
          inputRect === null
            ? null
            : {
                left: inputRect.left,
                right: inputRect.right,
                top: inputRect.top,
                bottom: inputRect.bottom,
              },
        )
      }

      function retryWordLookup() {
        if (wordPopover === null) return
        wordCacheRef.current.delete(wordPopover.key)
        openWordPopover(
          wordPopover.word,
          wordPopover.sentence,
          wordPopover.anchor,
          wordPopover.inputRect,
        )
      }

      async function saveWord() {
        const current = wordPopover
        if (
          current === null
          || current.status !== 'ready'
          || current.saving
          || current.saved
        ) {
          return
        }

        setWordPopover((state) => (
          state !== null && state.key === current.key
            ? { ...state, saving: true, saveError: null }
            : state
        ))

        try {
          await requestJson('/favorites', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              type: 'vocabulary',
              text: current.word,
              translation: current.meaning,
              source: current.sentence,
            }),
          })
          savedWordKeysRef.current.add(current.key)
          if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
          setToast({ tone: 'ok', text: t('favoriteToastSaved') })
          setWordPopover((state) => (
            state !== null && state.key === current.key
              ? { ...state, saving: false, saved: true, saveError: null }
              : state
          ))
          if (wordCloseTimerRef.current !== null) {
            window.clearTimeout(wordCloseTimerRef.current)
          }
          wordCloseTimerRef.current = window.setTimeout(() => {
            setWordPopover((state) => (
              state !== null && state.key === current.key ? null : state
            ))
            restoreInputFocus(true)
            wordCloseTimerRef.current = null
          }, 650)
        } catch (error) {
          const message = error?.message || t('wordSaveFailed')
          setWordPopover((state) => (
            state !== null && state.key === current.key
              ? { ...state, saving: false, saveError: message }
              : state
          ))
        }
      }

      const generateQuiz = useCallback(async () => {
        const previous = quizAbortRef.current
        if (previous !== null) previous.abort()
        const controller = new AbortController()
        quizAbortRef.current = controller

        setQuizOpen(true)
        setSubmitted(false)
        setAnswers({})
        setQuiz({
          status: 'loading',
          questions: [],
          error: null,
          provider: null,
          model: null,
          attempts: 0,
        })

        try {
          const data = await requestJson('/quiz', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title: article.title, text: article.text }),
            signal: controller.signal,
          })
          if (controller.signal.aborted) return
          const questions = assertQuizPayload(data?.questions)
          setQuiz({
            status: 'ready',
            questions,
            error: null,
            provider: data?.provider || null,
            model: data?.model || null,
            attempts: data?.attempts || 1,
          })
          if (data?.provider && data?.model) {
            setEngine({ state: 'ready', provider: data.provider, model: data.model })
          }
        } catch (error) {
          if (controller.signal.aborted || error?.name === 'AbortError') return
          setQuiz({
            status: 'error',
            questions: [],
            error: {
              code: error?.code || 'QUIZ_FAILED',
              message: error?.message || t('quizError'),
            },
            provider: null,
            model: null,
            attempts: 0,
          })
        } finally {
          if (quizAbortRef.current === controller) quizAbortRef.current = null
        }
      }, [t])

      const generateReading = useCallback(async () => {
        if (readingAbortRef.current !== null) readingAbortRef.current.abort()
        const controller = new AbortController()
        readingAbortRef.current = controller
        setReadingOpen(true)
        setReading({ status: 'loading', data: null, error: null })
        try {
          const data = await requestJson('/reading/analyze', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title: article.title, text: article.text }),
            signal: controller.signal,
          })
          if (controller.signal.aborted) return
          setReading({ status: 'ready', data: assertReadingPayload(data?.analysis), error: null })
        } catch (error) {
          if (controller.signal.aborted || error?.name === 'AbortError') return
          setReading({
            status: 'error',
            data: null,
            error: {
              code: error?.code || 'READING_FAILED',
              message: error?.message || t('readingError'),
            },
          })
        } finally {
          if (readingAbortRef.current === controller) readingAbortRef.current = null
        }
      }, [article.title, article.text, t])

      const openReading = useCallback(() => {
        if (reading.status === 'ready' || reading.status === 'error') {
          setReadingOpen(true)
          return
        }
        void generateReading()
      }, [reading.status, generateReading])

      const saveReadingVocabulary = useCallback(async (item) => {
        if (reading.status !== 'ready') return
        await requestJson('/favorites', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            type: 'vocabulary',
            text: item.word,
            translation: item.meaning,
            source: sourceSentenceFor(article.text, item.word),
            topics: reading.data.topics,
            pos: item.pos,
            isWritingVocab: item.is_writing_vocab === true,
          }),
        })
        if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
      }, [reading, article.text, onFavoriteSaved])

      const saveReadingSentence = useCallback(async (item) => {
        if (reading.status !== 'ready') return
        await requestJson('/favorites', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            type: 'sentence',
            text: item.sentence,
            translation: '',
            topics: reading.data.topics,
            analysis: item.analysis,
            embeddedPhrases: item.embedded_phrases,
          }),
        })
        if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
      }, [reading, onFavoriteSaved])

      const openQuiz = useCallback(() => {
        setQuizOpen(true)
        if (quiz.status === 'idle') void generateQuiz()
      }, [quiz.status, generateQuiz])

      const closeQuiz = useCallback(() => setQuizOpen(false), [])

      const answerQuiz = useCallback((index, label) => {
        if (submitted) return
        setAnswers((current) => ({ ...current, [index]: label }))
      }, [submitted])

      const submitQuiz = useCallback(() => {
        if (quiz.status !== 'ready') return
        const allAnswered = quiz.questions.every((_, index) => answers[index] !== undefined)
        if (!allAnswered) return
        setSubmitted(true)
      }, [quiz, answers])

      const resetQuizAnswers = useCallback(() => {
        setAnswers({})
        setSubmitted(false)
      }, [])

      const regenerateQuiz = useCallback(() => {
        if (
          quiz.status === 'ready'
          && (Object.keys(answers).length > 0 || submitted)
          && !window.confirm(t('quizRegenerateConfirm'))
        ) {
          return
        }
        void generateQuiz()
      }, [quiz.status, answers, submitted, generateQuiz, t])

      const commitCurrent = useCallback((byEnter) => {
        if (done) return
        if (lastCommittedRef.current === index) return
        if (typed.trim().length === 0) {
          setHint(t('emptyHint'))
          return
        }

        const exactNow = typed.trimEnd() === sentence
        if (!exactNow && !byEnter) {
          setHint(t('notExactHint'))
          return
        }

        lastCommittedRef.current = index
        const record = {
          index,
          en: sentence,
          zh: '',
          status: 'pending',
          error: null,
          provider: null,
          model: null,
          hadErrors: !exactNow,
        }

        setRecords((current) => (
          current.some((item) => item.index === index) ? current : [...current, record]
        ))
        setIndex((current) => current + 1)
        setTyped('')
        setHint('')
        runTranslation(record)
      }, [done, index, typed, sentence, runTranslation, t])

      useEffect(() => {
        if (!done && typed.trimEnd() === sentence) commitCurrent(false)
      }, [typed, done, sentence, commitCurrent])

      function handleChange(event) {
        setTyped(event.target.value.replace(/\r?\n/g, ' '))
        if (hint.length > 0) setHint('')
      }

      function handleKeyDown(event) {
        if (event.key !== 'Enter') return
        if (event.nativeEvent?.isComposing) return
        event.preventDefault()
        commitCurrent(true)
      }

      function applyImportedArticle(nextArticle) {
        if (typeof nextArticle?.text !== 'string' || nextArticle.text.trim().length === 0) return
        for (const controller of controllersRef.current.values()) controller.abort()
        controllersRef.current.clear()
        if (quizAbortRef.current !== null) quizAbortRef.current.abort()
        if (readingAbortRef.current !== null) readingAbortRef.current.abort()
        setReadingOpen(false)
        setReading({ status: 'idle', data: null, error: null })
        dismissWordLookup(false)
        lastCommittedRef.current = -1
        setArticle({
          title: typeof nextArticle.title === 'string' && nextArticle.title.trim().length > 0
            ? nextArticle.title.trim()
            : t('importPastedTitle'),
          text: nextArticle.text,
        })
        setIndex(0)
        setTyped('')
        setRecords([])
        setHint('')
        setSavedKeys({})
        setSavingKeys({})
        setToast(null)
        setFloatMenu(null)
        setQuizOpen(false)
        setQuiz({
          status: 'idle',
          questions: [],
          error: null,
          provider: null,
          model: null,
          attempts: 0,
        })
        setAnswers({})
        setSubmitted(false)
        setImportOpen(false)
        window.setTimeout(() => inputRef.current?.focus(), 0)
      }

      function reset() {
        if ((records.length > 0 || typed.length > 0) && !window.confirm(t('resetConfirm'))) return
        for (const controller of controllersRef.current.values()) controller.abort()
        controllersRef.current.clear()
        dismissWordLookup(false)
        lastCommittedRef.current = -1
        setRecords([])
        setIndex(0)
        setTyped('')
        setHint('')
        window.setTimeout(() => inputRef.current?.focus(), 0)
      }

      const diffLabel = exact
        ? t('exact')
        : `${errors} ${t('errorUnit')}${extra > 0 ? ` · ${extra} ${t('extraChars')}` : ''}`

      return h(
        'div',
        {
          className: embedded ? 'tp-root tp-embeddedRoot' : 'tp-root',
          ref: rootRef,
          onMouseUp: handleRootMouseUp,
        },
        floatMenu === null
          ? null
          : h(SelectionChip, {
              menu: floatMenu,
              t,
              onOpen: () => setFloatMenu((current) => (current === null ? null : { ...current, mode: 'pick' })),
              onPick: pickFavoriteType,
              onClose: () => setFloatMenu(null),
            }),
        toast === null
          ? null
          : h(
              'div',
              {
                className: toast.tone === 'error' ? 'tp-favToast tp-favToastError' : 'tp-favToast',
                role: 'status',
              },
              toast.text,
            ),
        h(
          'header',
          { className: embedded ? 'tp-header tp-headerEmbedded' : 'tp-header' },
          embedded
            ? null
            : h(
                'div',
                { className: 'tp-heading' },
                h('h1', { className: 'tp-title' }, t('panelTitle')),
                h('p', { className: 'tp-subtitle' }, t('panelSubtitle')),
              ),
          h(
            'div',
            { className: 'tp-headerActions' },
            h(EngineBadge, { engine, t }),
            h(
              'button',
              { className: 'tp-btn', type: 'button', onClick: () => setImportOpen(true) },
              t('importArticle'),
            ),
            h(
              'button',
              { className: 'tp-btn', type: 'button', onClick: reset },
              t('restart'),
            ),
          ),
        ),
        engine.state === 'error'
          ? h(
              'div',
              { className: 'tp-alert' },
              h(
                'div',
                { className: 'tp-alertText' },
                h('div', null, engine.message || t('engineError')),
                h('div', { className: 'tp-alertHint' }, t('noFallbackHint')),
              ),
            )
          : null,
        h(
          'div',
          { className: 'tp-grid' },
          h(
            'div',
            { className: 'tp-left' },
            h(
              'section',
              { className: 'tp-card tp-reader' },
              h(
                'div',
                { className: 'tp-cardHead' },
                h('h2', { className: 'tp-cardTitle' }, t('articleLabel')),
                h(
                  'div',
                  { className: 'tp-cardHeadRight' },
                  h('span', { className: 'tp-cardMeta' }, `${Math.min(index + 1, total)} / ${total}`),
                  h(
                    'button',
                    {
                      className: 'tp-btn tp-btnSmall tp-readingBtn',
                      type: 'button',
                      disabled: reading.status === 'loading',
                      onClick: openReading,
                    },
                    reading.status === 'loading' ? t('readingGeneratingShort') : t('readingButton'),
                  ),
                  h(
                    'button',
                    {
                      className: 'tp-btn tp-btnSmall tp-quizBtn',
                      type: 'button',
                      onClick: openQuiz,
                      disabled: quiz.status === 'loading',
                      title: t('quizGenerateHint'),
                      'aria-haspopup': 'dialog',
                    },
                    quiz.status === 'loading'
                      ? t('quizGenerating')
                      : quiz.status === 'ready'
                        ? t('quizOpen')
                        : t('quizGenerate'),
                  ),
                ),
              ),
              h(
                'div',
                { className: 'tp-article' },
                h('h3', { className: 'tp-articleTitle' }, article.title),
                sentenceGroups.map((group, groupIndex) => h(
                  'p',
                  {
                    key: groupIndex,
                    className: 'tp-sentences tp-paragraph',
                  },
                  group.items.map((item, localIndex) => {
                    const itemIndex = group.start + localIndex
                    return h(
                      'span',
                      {
                        key: itemIndex,
                        className: [
                          'tp-sentence',
                          itemIndex === index ? 'tp-sentenceActive' : '',
                          itemIndex < index ? 'tp-sentenceDone' : '',
                        ].filter(Boolean).join(' '),
                      },
                      h(SentenceText, {
                        text: item,
                        typed: itemIndex === index ? typed : '',
                        active: itemIndex === index,
                        sentence: item,
                        onWordClick: handleWordClick,
                      }),
                      localIndex < group.items.length - 1 ? ' ' : '',
                    )
                  }),
                )),
              ),
              h(
                'div',
                { className: 'tp-inputCard' },
                done
                  ? h(
                      'div',
                      { className: 'tp-doneBox' },
                      h('div', { className: 'tp-doneTitle' }, t('doneTitle')),
                      h('p', { className: 'tp-doneBody' }, t('doneBody')),
                      h(
                        'button',
                        { className: 'tp-btn', type: 'button', onClick: reset },
                        t('restart'),
                      ),
                    )
                  : h(
                      React.Fragment,
                      null,
                      h(
                        'div',
                        { className: 'tp-inputTop' },
                        h('strong', null, `${t('inputLabel')} · ${t('sentenceLabel')} ${index + 1}`),
                        h(
                          'span',
                          { className: exact ? 'tp-diff tp-diffOk' : 'tp-diff' },
                          diffLabel,
                        ),
                      ),
                      h('textarea', {
                        ref: inputRef,
                        className: 'tp-textarea',
                        value: typed,
                        onChange: handleChange,
                        onKeyDown: handleKeyDown,
                        placeholder: t('typingHint'),
                        spellCheck: false,
                        autoCapitalize: 'off',
                        autoCorrect: 'off',
                        autoComplete: 'off',
                        'aria-label': `${t('inputLabel')} ${index + 1}`,
                      }),
                      h(
                        'div',
                        {
                          className: hint.length > 0
                            ? 'tp-inputHint tp-inputHintWarn'
                            : 'tp-inputHint',
                        },
                        hint.length > 0
                          ? hint
                          : exact
                            ? t('exactHint')
                            : t('typingHint'),
                      ),
                      h(
                        'div',
                        { className: 'tp-progress', 'aria-label': t('progressLabel') },
                        h('div', { className: 'tp-progressBar', style: { width: `${progress}%` } }),
                      ),
                    ),
              ),
            ),
          ),
          h(
            'aside',
            { className: 'tp-side' },
            h(
              'section',
              { className: 'tp-card tp-current' },
              h(
                'div',
                { className: 'tp-cardHead' },
                h('h2', { className: 'tp-cardTitle' }, t('currentTitle')),
                latestRecord !== null
                  ? h(
                      'span',
                      { className: 'tp-cardMeta' },
                      `${latestRecord.index + 1} / ${total}`,
                    )
                  : null,
              ),
              h(
                'div',
                { className: 'tp-currentBody' },
                h(TranslationCard, {
                  record: latestRecord,
                  t,
                  onRetry: runTranslation,
                  onCollect: collectSentence,
                  saved: latestRecord !== null && savedKeys[`s${latestRecord.index}`] === true,
                  busy: latestRecord !== null && savingKeys[`s${latestRecord.index}`] === true,
                }),
              ),
            ),
            h(
              'section',
              { className: 'tp-card tp-records' },
              h(
                'div',
                { className: 'tp-cardHead' },
                h('h2', { className: 'tp-cardTitle' }, t('recordsTitle')),
                h('span', { className: 'tp-cardMeta' }, `${records.length} / ${total}`),
              ),
              h(
                'div',
                { className: 'tp-recordList', ref: listRef },
                records.length === 0
                  ? h('div', { className: 'tp-empty' }, t('recordsEmpty'))
                  : records.map((record) => h(RecordRow, {
                      key: record.index,
                      record,
                      t,
                      onRetry: runTranslation,
                      onCollect: collectSentence,
                      saved: savedKeys[`s${record.index}`] === true,
                      busy: savingKeys[`s${record.index}`] === true,
                    })),
              ),
            ),
          ),
        ),
        quizOpen
          ? h(QuizDrawer, {
              quiz,
              answers,
              submitted,
              t,
              onClose: closeQuiz,
              onAnswer: answerQuiz,
              onSubmit: submitQuiz,
              onReset: resetQuizAnswers,
              onGenerate: regenerateQuiz,
            })
          : null,
        importOpen
          ? h(ImportArticleModal, {
              t,
              onClose: () => setImportOpen(false),
              onImport: applyImportedArticle,
            })
          : null,
        readingOpen
          ? h(ReadingAnalysisModal, {
              t,
              state: reading,
              onClose: () => setReadingOpen(false),
              onRetry: generateReading,
              onSaveVocabulary: saveReadingVocabulary,
              onSaveSentence: saveReadingSentence,
            })
          : null,
        wordPopover
          ? h(WordModal, {
              data: wordPopover,
              t,
              onClose: () => dismissWordLookup(true),
              onSave: saveWord,
              onRetry: retryWordLookup,
            })
          : null,
      )
    }

module.exports = { TypingWorkspace: PracticeView }
