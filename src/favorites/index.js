const {
  React, h, useCallback, useEffect, useMemo, useState,
  requestJson, useT,
} = require('../shared.js')

    function formatStamp(value) {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      const pad = (input) => String(input).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    function normalizeType(item) {
      return item.type === 'word' ? 'vocabulary' : item.type
    }

    const FAVORITE_CATEGORIES = [
      '社会热点',
      '科技与生活',
      '文化与教育',
      '人生哲理',
      '经济与商业',
      '环境与健康',
    ]

    function parseTopicEntry(topic) {
      if (topic !== null && typeof topic === 'object' && !Array.isArray(topic)) {
        const category = typeof topic.category === 'string' ? topic.category.trim() : ''
        const subcategory = typeof topic.subcategory === 'string' ? topic.subcategory.trim() : ''
        return category.length > 0 && subcategory.length > 0
          ? { category, subcategory }
          : null
      }
      const parts = String(topic ?? '').split('/').map((part) => part.trim()).filter(Boolean)
      if (parts.length === 0) return null
      return parts.length === 1
        ? { category: '社会热点', subcategory: parts[0] }
        : { category: parts[0], subcategory: parts.slice(1).join('/') }
    }

    function itemTopics(item) {
      if (!Array.isArray(item.topics)) return []
      const seen = new Set()
      return item.topics.map(parseTopicEntry).filter((topic) => {
        if (topic === null) return false
        const key = `${topic.category}\u0000${topic.subcategory}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    function FavoritesView(props) {
      const { ctx, refreshToken = 0, onClose, onSendToTyping } = props
      const t = useT(ctx)
      const [state, setState] = useState({ loading: true, error: null, items: [] })
      const [activeType, setActiveType] = useState('vocabulary')
      const [tagMajor, setTagMajor] = useState(null)
      const [tagMinor, setTagMinor] = useState(null)
      const [deleting, setDeleting] = useState({})
      const [noteEditing, setNoteEditing] = useState(null)
      const [noteDraft, setNoteDraft] = useState('')
      const [savingNote, setSavingNote] = useState(null)

      const reload = useCallback(async () => {
        setState((current) => ({ ...current, loading: true, error: null }))
        try {
          const data = await requestJson('/favorites', { method: 'GET' })
          setState({
            loading: false,
            error: null,
            items: Array.isArray(data?.items) ? data.items : [],
          })
        } catch (error) {
          setState({
            loading: false,
            error: error?.code === 'STORAGE_UNAVAILABLE'
              ? t('favoritesStorageError')
              : (error?.message || t('favoritesStorageError')),
            items: [],
          })
        }
      }, [t])

      useEffect(() => {
        void reload()
      }, [reload, refreshToken])

      const remove = useCallback(async (item) => {
        if (!window.confirm(t('favoritesDeleteConfirm'))) return
        setDeleting((current) => ({ ...current, [item.id]: true }))
        try {
          await requestJson('/favorites/delete', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: item.id }),
          })
          setState((current) => ({
            ...current,
            items: current.items.filter((entry) => entry.id !== item.id),
          }))
        } catch (error) {
          setState((current) => ({ ...current, error: error?.message || t('favoriteToastFailed') }))
        } finally {
          setDeleting((current) => {
            const next = { ...current }
            delete next[item.id]
            return next
          })
        }
      }, [t])

      const saveNote = useCallback(async (item) => {
        setSavingNote(item.id)
        try {
          const data = await requestJson('/favorites/update', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: item.id, note: noteDraft }),
          })
          const nextItem = data?.item
          setState((current) => ({
            ...current,
            items: current.items.map((entry) => (
              entry.id === item.id
                ? { ...entry, note: typeof nextItem?.note === 'string' ? nextItem.note : noteDraft.trim() }
                : entry
            )),
          }))
          setNoteEditing(null)
          setNoteDraft('')
        } catch (error) {
          setState((current) => ({ ...current, error: error?.message || t('favoritesNoteFailed') }))
        } finally {
          setSavingNote(null)
        }
      }, [noteDraft, t])

      const counts = useMemo(() => {
        const vocabulary = state.items.filter((item) => normalizeType(item) === 'vocabulary').length
        const sentence = state.items.filter((item) => normalizeType(item) === 'sentence').length
        return { vocabulary, sentence }
      }, [state.items])

      const typeItems = useMemo(
        () => state.items.filter((item) => normalizeType(item) === activeType),
        [state.items, activeType],
      )

      const tagTree = useMemo(() => {
        const majors = new Map()
        for (const name of FAVORITE_CATEGORIES) {
          majors.set(name, { name, count: 0, minors: new Map() })
        }

        const ensureTopic = (topic) => {
          let major = majors.get(topic.category)
          if (major === undefined) {
            major = { name: topic.category, count: 0, minors: new Map() }
            majors.set(topic.category, major)
          }
          const path = `${topic.category}/${topic.subcategory}`
          if (!major.minors.has(path)) {
            major.minors.set(path, { name: topic.subcategory, path, count: 0 })
          }
          return major
        }

        for (const item of state.items) {
          for (const topic of itemTopics(item)) ensureTopic(topic)
        }

        for (const item of typeItems) {
          const seenMajor = new Set()
          const seenMinor = new Set()
          for (const topic of itemTopics(item)) {
            const major = ensureTopic(topic)
            if (!seenMajor.has(major.name)) {
              major.count += 1
              seenMajor.add(major.name)
            }
            const path = `${topic.category}/${topic.subcategory}`
            const minor = major.minors.get(path)
            if (!seenMinor.has(path)) {
              minor.count += 1
              seenMinor.add(path)
            }
          }
        }

        return Array.from(majors.values()).map((major) => ({
          ...major,
          minors: new Map(
            Array.from(major.minors.values())
              .sort((left, right) => (
                right.count - left.count || left.name.localeCompare(right.name)
              ))
              .map((minor) => [minor.path, minor]),
          ),
        }))
      }, [state.items, typeItems])

      const activeMajor = tagMajor === null
        ? null
        : tagTree.find((entry) => entry.name === tagMajor) ?? null

      useEffect(() => {
        if (tagMajor === null) {
          if (tagMinor !== null) setTagMinor(null)
          return
        }
        if (activeMajor === null) {
          setTagMajor(null)
          setTagMinor(null)
          return
        }
        if (tagMinor !== null && !activeMajor.minors.has(`${tagMajor}/${tagMinor}`)) {
          setTagMinor(null)
        }
      }, [tagMajor, tagMinor, activeMajor])

      const visibleItems = useMemo(() => (
        tagMajor === null
          ? typeItems
          : typeItems.filter((item) => itemTopics(item).some((topic) => (
              topic.category === tagMajor
              && (tagMinor === null || topic.subcategory === tagMinor)
            )))
      ), [typeItems, tagMajor, tagMinor])

      const openNote = (item) => {
        setNoteEditing(item.id)
        setNoteDraft(typeof item.note === 'string' ? item.note : '')
      }

      const cancelNote = () => {
        setNoteEditing(null)
        setNoteDraft('')
      }

      const follow = (item) => {
        if (typeof onSendToTyping !== 'function') return
        const type = normalizeType(item)
        const text = type === 'vocabulary' && typeof item.source === 'string' && item.source.trim().length > 0
          ? item.source.trim()
          : item.text
        const accepted = onSendToTyping({
          title: type === 'vocabulary'
            ? `${t('favoritesFollowWord')} · ${item.text}`
            : t('favoritesFollowSentence'),
          text,
        })
        if (accepted && typeof onClose === 'function') onClose()
      }

      const renderPhrases = (item) => {
        const phrases = Array.isArray(item.embeddedPhrases) ? item.embeddedPhrases : []
        if (phrases.length === 0) return null
        return h(
          'details',
          { className: 'tp-favPhrases' },
          h('summary', null, `${t('favoritesEmbeddedPhrases')} · ${phrases.length}`),
          h(
            'ul',
            { className: 'tp-favPhraseList' },
            phrases.map((phrase, index) => h(
              'li',
              { key: index },
              h('strong', null, phrase.phrase),
              h('span', null, phrase.meaning),
            )),
          ),
        )
      }

      const renderItem = (item) => {
        const type = normalizeType(item)
        const topics = itemTopics(item)
        const note = typeof item.note === 'string' ? item.note.trim() : ''
        return h(
          'article',
          { className: 'tp-favItem', key: item.id },
          h(
            'div',
            { className: 'tp-favItemHead' },
            h(
              'span',
              { className: type === 'vocabulary' ? 'tp-favType tp-favTypeWord' : 'tp-favType tp-favTypeSentence' },
              type === 'vocabulary' ? t('favoriteTypeVocabulary') : t('favoriteTypeSentence'),
            ),
            type === 'vocabulary' && item.isWritingVocab === true
              ? h('span', { className: 'tp-favWriting' }, t('favoritesWritingVocab'))
              : null,
            h('span', { className: 'tp-favMeta' }, formatStamp(item.createdAt)),
            h(
              'div',
              { className: 'tp-favItemActions' },
              typeof onSendToTyping === 'function'
                ? h(
                    'button',
                    {
                      className: 'tp-favPlay',
                      type: 'button',
                      onClick: () => follow(item),
                    },
                    type === 'vocabulary' ? `⌨️ ${t('favoritesFollowWord')}` : `⌨️ ${t('favoritesFollowSentence')}`,
                  )
                : null,
              h(
                'button',
                {
                  className: 'tp-favDel',
                  type: 'button',
                  disabled: deleting[item.id] === true,
                  onClick: () => { void remove(item) },
                },
                t('favoritesDelete'),
              ),
            ),
          ),
          h(
            'div',
            { className: 'tp-favTextRow' },
            h('p', { className: 'tp-favText' }, item.text),
            type === 'vocabulary' && item.pos ? h('span', { className: 'tp-favPos' }, item.pos) : null,
          ),
          item.translation ? h('p', { className: 'tp-favZh' }, item.translation) : null,
          type === 'sentence' && item.analysis
            ? h('p', { className: 'tp-favAnalysis' }, item.analysis)
            : null,
          renderPhrases(item),
          topics.length > 0
            ? h(
                'div',
                { className: 'tp-favTags' },
                topics.map((topic) => h(
                  'span',
                  {
                    className: 'tp-favTag',
                    key: `${topic.category}/${topic.subcategory}`,
                  },
                  `${topic.category} / ${topic.subcategory}`,
                )),
              )
            : null,
          item.source ? h('p', { className: 'tp-favSource' }, `${t('favoritesSource')} · ${item.source}`) : null,
          noteEditing === item.id
            ? h(
                'div',
                { className: 'tp-favNoteEditor' },
                h('textarea', {
                  className: 'tp-favNoteInput',
                  value: noteDraft,
                  onChange: (event) => setNoteDraft(event.target.value),
                  placeholder: t('favoritesNotePlaceholder'),
                  maxLength: 4000,
                  rows: 3,
                }),
                h(
                  'div',
                  { className: 'tp-favNoteActions' },
                  h(
                    'button',
                    {
                      className: 'tp-btn tp-btnSmall',
                      type: 'button',
                      disabled: savingNote === item.id,
                      onClick: () => { void saveNote(item) },
                    },
                    savingNote === item.id ? t('favoritesNoteSaving') : t('favoritesNoteSave'),
                  ),
                  h(
                    'button',
                    { className: 'tp-btn tp-btnSmall', type: 'button', onClick: cancelNote },
                    t('favoritesNoteCancel'),
                  ),
                ),
              )
            : h(
                React.Fragment,
                null,
                note.length > 0
                  ? h('p', { className: 'tp-favNote' }, note)
                  : null,
                h(
                  'button',
                  {
                    className: 'tp-favNoteBtn',
                    type: 'button',
                    onClick: () => openNote(item),
                  },
                  note.length > 0 ? t('favoritesNoteEdit') : t('favoritesNoteAdd'),
                ),
              ),
        )
      }

      const typeTab = (value, label, count) => h(
        'button',
        {
          key: value,
          className: activeType === value ? 'tp-favTypeTab tp-favTypeTabActive' : 'tp-favTypeTab',
          type: 'button',
          onClick: () => {
            setActiveType(value)
            setNoteEditing(null)
          },
        },
        `${label} ${count}`,
      )

      return h(
        'div',
        { className: 'tp-root tp-favRoot' },
        h(
          'header',
          { className: 'tp-header' },
          h(
            'div',
            { className: 'tp-heading' },
            h('h1', { className: 'tp-title' }, t('favoritesTitle')),
            h('p', { className: 'tp-subtitle' }, t('favoritesSubtitle')),
          ),
          h(
            'div',
            { className: 'tp-headerActions' },
            h('button', { className: 'tp-btn', type: 'button', onClick: () => { void reload() } }, t('favoritesRefresh')),
            onClose === undefined
              ? null
              : h(
                  'button',
                  {
                    className: 'tp-favClose',
                    type: 'button',
                    'aria-label': t('favoritesClose'),
                    title: t('favoritesClose'),
                    onClick: onClose,
                  },
                  '×',
                ),
          ),
        ),
        h(
          'div',
          { className: 'tp-favTypeTabs' },
          typeTab('vocabulary', t('favoriteTypeVocabulary'), counts.vocabulary),
          typeTab('sentence', t('favoriteTypeSentence'), counts.sentence),
        ),
        tagTree.length > 0
          ? h(
              'div',
              { className: 'tp-favTagCloud' },
              h(
                'div',
                { className: 'tp-favTagCloudHead' },
                h('span', null, t('favoritesTagFilter')),
                tagMajor === null
                  ? null
                  : h(
                      'button',
                      {
                        className: 'tp-favTagClear',
                        type: 'button',
                        onClick: () => {
                          setTagMajor(null)
                          setTagMinor(null)
                        },
                      },
                      t('favoritesTagAll'),
                    ),
              ),
              h(
                'div',
                { className: 'tp-favTagList' },
                h(
                  'button',
                  {
                    className: tagMajor === null ? 'tp-favTagChip tp-favTagChipActive' : 'tp-favTagChip',
                    type: 'button',
                    onClick: () => {
                      setTagMajor(null)
                      setTagMinor(null)
                    },
                  },
                  t('favoritesTagAllShort'),
                ),
                tagTree.map((entry) => h(
                  'button',
                  {
                    key: entry.name,
                    className: tagMajor === entry.name ? 'tp-favTagChip tp-favTagChipActive' : 'tp-favTagChip',
                    type: 'button',
                    onClick: () => {
                      if (tagMajor === entry.name) {
                        setTagMajor(null)
                        setTagMinor(null)
                      } else {
                        setTagMajor(entry.name)
                        setTagMinor(null)
                      }
                    },
                  },
                  `${entry.name} ${entry.count}`,
                )),
              ),
              activeMajor !== null && activeMajor.minors.size > 0
                ? h(
                    'div',
                    { className: 'tp-favTagSubList' },
                    h(
                      'button',
                      {
                        className: tagMinor === null
                          ? 'tp-favTagChip tp-favTagChipActive'
                          : 'tp-favTagChip',
                        type: 'button',
                        onClick: () => setTagMinor(null),
                      },
                      `${activeMajor.name} · ${t('favoritesTagAllShort')}`,
                    ),
                    Array.from(activeMajor.minors.values()).map((minor) => h(
                      'button',
                      {
                        key: minor.path,
                        className: tagMinor === minor.name
                          ? 'tp-favTagChip tp-favTagChipActive'
                          : 'tp-favTagChip',
                        type: 'button',
                        onClick: () => setTagMinor((current) => (
                          current === minor.name ? null : minor.name
                        )),
                      },
                      `${minor.name} ${minor.count}`,
                    )),
                  )
                : null,
            )
          : null,
        state.error !== null
          ? h('div', { className: 'tp-alert' }, state.error)
          : null,
        h(
          'div',
          { className: 'tp-favList' },
          state.loading && state.items.length === 0
            ? h('div', { className: 'tp-favState' }, t('favoritesLoading'))
            : state.items.length === 0
              ? h('div', { className: 'tp-favState' }, t('favoritesEmpty'))
              : visibleItems.length === 0
                ? h(
                    'div',
                    { className: 'tp-favState' },
                    tagMajor === null ? t('favoritesEmpty') : t('favoritesTagEmpty'),
                  )
                : visibleItems.map(renderItem),
        ),
      )
    }

    function FavoritesDrawer(props) {
      const { ctx, open, onClose, refreshToken, onSendToTyping } = props
      const t = useT(ctx)

      useEffect(() => {
        if (!open) return undefined
        const onKeyDown = (event) => {
          if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [open, onClose])

      if (!open) return null

      return h(
        'div',
        { className: 'tp-favDrawerLayer', onMouseUp: (event) => event.stopPropagation() },
        h('div', { className: 'tp-favDrawerBackdrop', onClick: onClose, 'aria-hidden': true }),
        h(
          'section',
          {
            className: 'tp-favDrawerPanel',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('favoritesTitle'),
          },
          h(FavoritesView, { ctx, refreshToken, onClose, onSendToTyping }),
        ),
      )
    }

module.exports = { FavoritesPanel: FavoritesView, FavoritesDrawer }
