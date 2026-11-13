const { React, h, useCallback, useState, useT } = require('./shared.js')
const { CSS, ESSAY_CSS, SHELL_CSS } = require('./styles.js')
const { TypingWorkspace } = require('./typing/index.js')
const { EssayWorkspace } = require('./essay/index.js')
const { FavoritesDrawer } = require('./favorites/index.js')
const {
  GlassBackgroundModal,
  clearStoredWallpaper,
  readStoredWallpaper,
  saveStoredWallpaper,
} = require('./glass-background.js')

function LearningShell(props) {
  const { ctx } = props
  const t = useT(ctx)
  const [activeTab, setActiveTab] = useState('typing')
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [favoritesRevision, setFavoritesRevision] = useState(0)
  const [backgroundOpen, setBackgroundOpen] = useState(false)
  const [wallpaper, setWallpaper] = useState(() => readStoredWallpaper())
  const [pendingTypingArticle, setPendingTypingArticle] = useState(null)
  const [typingHasPractice, setTypingHasPractice] = useState(false)

  const onFavoriteSaved = useCallback(() => {
    setFavoritesRevision((current) => current + 1)
  }, [])

  const applyBackground = useCallback((next) => {
    if (!saveStoredWallpaper(next)) throw new Error(t('backgroundSaveFailed'))
    setWallpaper(next)
    setBackgroundOpen(false)
  }, [t])

  const removeBackground = useCallback(() => {
    clearStoredWallpaper()
    setWallpaper(null)
  }, [])

  const handleTypingPracticeChange = useCallback((value) => {
    setTypingHasPractice(value === true)
  }, [])

  const sendTextToTyping = useCallback((article) => {
    if (
      typingHasPractice
      && !window.confirm(t('sampleOverwriteConfirm'))
    ) {
      return false
    }
    setPendingTypingArticle({
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: article.title,
      text: article.text,
    })
    setActiveTab('typing')
    return true
  }, [typingHasPractice, t])

  const consumePendingTypingArticle = useCallback((id) => {
    setPendingTypingArticle((current) => (
      current !== null && current.id === id ? null : current
    ))
  }, [])

  const tabs = [
    { id: 'typing', label: t('tabTypingReading') },
    { id: 'essay', label: t('tabEssay') },
  ]

  return h(
    'div',
    {
      className: 'tp-shell',
      style: wallpaper === null
        ? undefined
        : { '--tp-wallpaper': `url("${wallpaper.dataUrl}")` },
    },
    h('style', null, `${CSS}\n${ESSAY_CSS}\n${SHELL_CSS}`),
    h(
      'header',
      { className: 'tp-shellHeader' },
      h(
        'div',
        { className: 'tp-shellHeading' },
        h('h1', { className: 'tp-shellTitle' }, t('learningAssistantTitle')),
        h('p', { className: 'tp-shellSubtitle' }, t('learningAssistantSubtitle')),
      ),
      h(
        'div',
        { className: 'tp-shellActions' },
        h(
          'button',
          {
            className: 'tp-backgroundBtn',
            type: 'button',
            title: t('backgroundLabel'),
            'aria-label': t('backgroundLabel'),
            onClick: () => setBackgroundOpen(true),
          },
          t('backgroundLabel'),
        ),
        h(
          'button',
          {
            className: 'tp-starBtn',
            type: 'button',
            title: t('favoritesOpen'),
            'aria-label': t('favoritesOpen'),
            onClick: () => setFavoritesOpen(true),
          },
          '★',
        ),
      ),
    ),
    h(
      'nav',
      { className: 'tp-tabs', role: 'tablist', 'aria-label': t('learningAssistantTitle') },
      tabs.map((tab) => h(
        'button',
        {
          key: tab.id,
          id: `tp-tab-${tab.id}`,
          className: activeTab === tab.id ? 'tp-tab tp-tabActive' : 'tp-tab',
          type: 'button',
          role: 'tab',
          'aria-selected': activeTab === tab.id,
          'aria-controls': `tp-panel-${tab.id}`,
          tabIndex: activeTab === tab.id ? 0 : -1,
          onClick: () => setActiveTab(tab.id),
        },
        tab.label,
      )),
    ),
    h(
      'div',
      { className: 'tp-shellBody' },
      h(
        'div',
        {
          id: 'tp-panel-typing',
          className: 'tp-tabPanel',
          role: 'tabpanel',
          'aria-labelledby': 'tp-tab-typing',
          hidden: activeTab !== 'typing',
        },
        h(TypingWorkspace, {
          ctx,
          embedded: true,
          onFavoriteSaved,
          pendingArticle: pendingTypingArticle,
          onPendingArticleConsumed: consumePendingTypingArticle,
          onPracticeStateChange: handleTypingPracticeChange,
        }),
      ),
      h(
        'div',
        {
          id: 'tp-panel-essay',
          className: 'tp-tabPanel',
          role: 'tabpanel',
          'aria-labelledby': 'tp-tab-essay',
          hidden: activeTab !== 'essay',
        },
        h(EssayWorkspace, {
          ctx,
          embedded: true,
          onSendSampleToTyping: sendTextToTyping,
        }),
      ),
    ),
    h(FavoritesDrawer, {
      ctx,
      open: favoritesOpen,
      onClose: () => setFavoritesOpen(false),
      refreshToken: favoritesRevision,
      onSendToTyping: sendTextToTyping,
    }),
    backgroundOpen
      ? h(GlassBackgroundModal, {
          t,
          current: wallpaper,
          onApply: applyBackground,
          onRemove: removeBackground,
          onClose: () => setBackgroundOpen(false),
        })
      : null,
  )
}

module.exports = { LearningShell }
