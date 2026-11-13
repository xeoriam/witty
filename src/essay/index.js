const {
  React, h, useCallback, useEffect, useMemo, useRef, useState,
  requestJson, useT,
} = require('../shared.js')
const { EssaySampleModal } = require('./EssaySampleModal.js')
const { EssayArchiveView } = require('./EssayArchive.js')

    const ESSAY_POSITION_KEYS = {
      opening: 'essayPositionOpening',
      body: 'essayPositionBody',
      conclusion: 'essayPositionConclusion',
    }
    const ESSAY_CATEGORIES = [
      {
        id: 'society',
        zh: '社会热点',
        en: 'Society',
        descKey: 'essayCategorySocietyDesc',
      },
      {
        id: 'technology',
        zh: '科技与生活',
        en: 'Technology & Life',
        descKey: 'essayCategoryTechnologyDesc',
      },
      {
        id: 'culture_education',
        zh: '文化与教育',
        en: 'Culture & Education',
        descKey: 'essayCategoryCultureEducationDesc',
      },
      {
        id: 'philosophy',
        zh: '人生哲理',
        en: 'Philosophy',
        descKey: 'essayCategoryPhilosophyDesc',
      },
      {
        id: 'economy_business',
        zh: '经济与商业',
        en: 'Economy & Business',
        descKey: 'essayCategoryEconomyBusinessDesc',
      },
      {
        id: 'environment_health',
        zh: '环境与健康',
        en: 'Environment & Health',
        descKey: 'essayCategoryEnvironmentHealthDesc',
      },
    ]
    const ESSAY_CATEGORY_MAP = Object.fromEntries(
      ESSAY_CATEGORIES.map((category) => [category.id, category]),
    )
    function isSafeSvg(value) {
      if (typeof value !== 'string') return false
      const svg = value.trim()
      if (svg.length < 40 || svg.length > 30000) return false
      if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>$/i.test(svg)) return false
      if (!/\bviewBox\s*=/i.test(svg)) return false
      if (/<\s*(script|foreignObject|iframe|object|embed|image|style|link|meta|form|input|button|audio|video|canvas)\b/i.test(svg)) return false
      if (/\bon[a-z]+\s*=/i.test(svg)) return false
      if (/(?:href|xlink:href)\s*=/i.test(svg)) return false
      if (/javascript\s*:|\bdata\s*:|url\s*\(/i.test(svg)) return false
      if (/\bstyle\s*=/i.test(svg)) return false
      return true
    }
    function assertEssayTopicPayload(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('话题数据不是对象。')
      }
      if (typeof value.topic_id !== 'string' || value.topic_id.trim().length === 0) {
        throw new Error('话题缺少 topic_id。')
      }
      if (typeof value.topic_prompt !== 'string' || value.topic_prompt.trim().length === 0) {
        throw new Error('话题缺少 topic_prompt。')
      }
      if (!isSafeSvg(value.drawing_svg)) {
        throw new Error('话题缺少可安全渲染的 drawing_svg。')
      }
      if (!Array.isArray(value.related_vocabulary)
        || value.related_vocabulary.length < 8
        || value.related_vocabulary.length > 12) {
        throw new Error('相关词汇数量必须是 8–12 项。')
      }
      for (const item of value.related_vocabulary) {
        if (typeof item?.word !== 'string' || item.word.trim().length === 0) {
          throw new Error('相关词汇缺少英文词/短语。')
        }
        if (typeof item?.meaning !== 'string' || item.meaning.trim().length === 0) {
          throw new Error('相关词汇缺少中文释义。')
        }
      }
      if (!Array.isArray(value.useful_expressions)
        || value.useful_expressions.length < 5
        || value.useful_expressions.length > 8) {
        throw new Error('相关表述数量必须是 5–8 项。')
      }
      for (const item of value.useful_expressions) {
        if (typeof item?.expression !== 'string' || item.expression.trim().length === 0) {
          throw new Error('相关表述缺少英文句式。')
        }
        if (typeof item?.meaning !== 'string' || item.meaning.trim().length === 0) {
          throw new Error('相关表述缺少中文说明。')
        }
        if (typeof ESSAY_POSITION_KEYS[item?.position] !== 'string') {
          throw new Error('相关表述的适用位置无效。')
        }
      }
      if (!Array.isArray(value.cultural_background)
        || value.cultural_background.length < 3
        || value.cultural_background.length > 5) {
        throw new Error('文化背景必须是 3–5 条。')
      }
      if (value.cultural_background.some((item) => typeof item !== 'string' || item.trim().length === 0)) {
        throw new Error('文化背景包含空内容。')
      }

      return {
        topic_id: value.topic_id.trim(),
        topic_prompt: value.topic_prompt.trim(),
        drawing_svg: value.drawing_svg.trim(),
        related_vocabulary: value.related_vocabulary.map((item) => ({
          word: item.word.trim(),
          meaning: item.meaning.trim(),
        })),
        useful_expressions: value.useful_expressions.map((item) => ({
          expression: item.expression.trim(),
          meaning: item.meaning.trim(),
          position: item.position,
        })),
        cultural_background: value.cultural_background.map((item) => item.trim()),
      }
    }
    function assertEssayScorePayload(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('评分数据不是对象。')
      }
      const dimensions = value.dimensions
      if (dimensions === null || typeof dimensions !== 'object' || Array.isArray(dimensions)) {
        throw new Error('评分缺少 dimensions。')
      }
      for (const key of ['content', 'structure', 'language']) {
        const score = dimensions[key]
        if (!Number.isInteger(score) || score < 1 || score > 5) {
          throw new Error(`dimensions.${key} 必须是 1–5 的整数。`)
        }
      }
      const expectedTotal = Math.round(
        ((dimensions.content + dimensions.structure + dimensions.language) / 15) * 20,
      )
      if (!Number.isInteger(value.total_score) || value.total_score < 0 || value.total_score > 20) {
        throw new Error('total_score 必须是 0–20 的整数。')
      }
      if (value.total_score !== expectedTotal) {
        throw new Error('total_score 与三个维度的原始分不匹配。')
      }
      if (typeof value.band !== 'string' || value.band.trim().length === 0) {
        throw new Error('评分缺少 band。')
      }
      if (!Array.isArray(value.paragraph_feedback) || value.paragraph_feedback.length === 0) {
        throw new Error('评分缺少段落批改反馈。')
      }
      for (const item of value.paragraph_feedback) {
        if (!Number.isInteger(item?.paragraph_index) || item.paragraph_index < 1) {
          throw new Error('段落批改缺少有效的 paragraph_index。')
        }
        if (typeof item?.original_text !== 'string' || item.original_text.trim().length === 0) {
          throw new Error('段落批改缺少原文片段。')
        }
        if (typeof item?.paragraph_critique !== 'string' || item.paragraph_critique.trim().length === 0) {
          throw new Error('段落批改缺少批改意见。')
        }
        if (typeof item?.rewritten_paragraph !== 'string' || item.rewritten_paragraph.trim().length === 0) {
          throw new Error('段落批改缺少高分重写范文。')
        }
      }

      return {
        dimensions: {
          content: dimensions.content,
          structure: dimensions.structure,
          language: dimensions.language,
        },
        total_score: value.total_score,
        band: value.band.trim(),
        paragraph_feedback: value.paragraph_feedback.map((item) => ({
          paragraph_index: item.paragraph_index,
          original_text: item.original_text.trim(),
          paragraph_critique: item.paragraph_critique.trim(),
          rewritten_paragraph: item.rewritten_paragraph.trim(),
        })),
      }
    }
    function assertEssayStatsPayload(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('作文统计不是对象。')
      }
      if (!Array.isArray(value.categories) || value.categories.length !== ESSAY_CATEGORIES.length) {
        throw new Error('作文统计分类数量不正确。')
      }
      const categories = value.categories.map((item) => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error('作文统计分类项无效。')
        }
        if (!Object.prototype.hasOwnProperty.call(ESSAY_CATEGORY_MAP, item.category)) {
          throw new Error('作文统计包含未知分类。')
        }
        if (!Number.isInteger(item.count) || item.count < 0) {
          throw new Error('作文统计练习次数无效。')
        }
        if (
          item.averageScore !== null
          && (
            typeof item.averageScore !== 'number'
            || !Number.isFinite(item.averageScore)
            || item.averageScore < 0
            || item.averageScore > 20
          )
        ) {
          throw new Error('作文统计平均分无效。')
        }
        return {
          category: item.category,
          count: item.count,
          averageScore: item.averageScore,
          lastPracticedAt: typeof item.lastPracticedAt === 'string' ? item.lastPracticedAt : null,
        }
      })
      if (!Number.isInteger(value.totalAttempts) || value.totalAttempts < 0) {
        throw new Error('作文统计总次数无效。')
      }
      if (
        value.recommended === null
        || typeof value.recommended !== 'object'
        || !Object.prototype.hasOwnProperty.call(ESSAY_CATEGORY_MAP, value.recommended.category)
        || !['unpracticed', 'lowest_average'].includes(value.recommended.reason)
      ) {
        throw new Error('作文统计推荐项无效。')
      }
      return {
        totalAttempts: value.totalAttempts,
        categories,
        recommended: {
          category: value.recommended.category,
          reason: value.recommended.reason,
        },
      }
    }
    function assertEssaySamplePayload(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('范文数据不是对象。')
      }
      const essayText = typeof value.essay_text === 'string' ? value.essay_text.trim() : ''
      const translation = typeof value.translation === 'string' ? value.translation.trim() : ''
      if (essayText.length === 0) throw new Error('范文缺少英文正文。')
      if (translation.length === 0) throw new Error('范文缺少中文翻译。')
      if (!Array.isArray(value.highlights) || value.highlights.length < 3 || value.highlights.length > 5) {
        throw new Error('范文亮点必须是 3–5 条。')
      }
      const highlights = value.highlights.map((item) => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error('范文亮点条目无效。')
        }
        if (!['vocabulary', 'structure'].includes(item.kind)) {
          throw new Error('范文亮点类型无效。')
        }
        const text = typeof item.text === 'string' ? item.text.trim() : ''
        const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : ''
        if (text.length === 0 || explanation.length === 0) {
          throw new Error('范文亮点缺少词汇或解析。')
        }
        return { kind: item.kind, text, explanation }
      })
      const coreArgument = typeof value.core_argument === 'string'
        ? value.core_argument.trim().slice(0, 500)
        : ''
      return {
        essay_text: essayText,
        translation,
        ...(coreArgument.length === 0 ? {} : { core_argument: coreArgument }),
        highlights,
      }
    }

    function essayPositionLabel(t, position) {
      const key = ESSAY_POSITION_KEYS[position]
      return key === undefined ? position : t(key)
    }
    function EssayScorePanel(props) {
      const { score, t, onRetry, canRetry } = props

      if (score.status === 'idle') {
        return h('div', { className: 'tp-essayScorePlaceholder' }, t('essayBeforeScore'))
      }
      if (score.status === 'loading') {
        return h(
          'div',
          { className: 'tp-quizLoading' },
          h('div', { className: 'tp-quizSpinner' }),
          h('div', { className: 'tp-quizLoadingText' }, t('essayScoreLoading')),
          h('div', { className: 'tp-quizLoadingHint' }, t('essayScoreHint')),
        )
      }
      if (score.status === 'error') {
        return h(
          'div',
          { className: 'tp-essayScorePlaceholder' },
          h(
            'div',
            { className: 'tp-alert' },
            h(
              'div',
              { className: 'tp-alertText' },
              h('div', null, score.error?.message || t('essayScoreError')),
              h('div', { className: 'tp-alertHint' }, t('essayErrorHint')),
            ),
            h(
              'button',
              {
                className: 'tp-btn',
                type: 'button',
                disabled: !canRetry,
                onClick: onRetry,
              },
              t('essayRetryScore'),
            ),
          ),
        )
      }

      const data = score.data
      const dimensions = [
        ['content', t('essayDimensionContent')],
        ['structure', t('essayDimensionStructure')],
        ['language', t('essayDimensionLanguage')],
      ]

      return h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'tp-essayScoreHero' },
          h(
            'div',
            null,
            h('div', { className: 'tp-essayTotalLabel' }, t('essayTotalScore')),
            h(
              'div',
              { className: 'tp-essayTotal' },
              h('span', { className: 'tp-essayTotalNumber' }, String(data.total_score)),
              h('span', { className: 'tp-essayTotalMax' }, '/ 20'),
            ),
          ),
          h(
            'div',
            { className: 'tp-essayBand' },
            h('div', { className: 'tp-essayBandLabel' }, t('essayBand')),
            h('div', { className: 'tp-essayBandValue' }, data.band),
          ),
        ),
        h(
          'div',
          { className: 'tp-essayDimensionGrid' },
          dimensions.map(([key, label]) => h(
            'div',
            { className: 'tp-essayDimension', key },
            h('div', { className: 'tp-essayDimensionLabel' }, label),
            h(
              'div',
              { className: 'tp-essayDimensionScore' },
              String(data.dimensions[key]),
              h('span', { className: 'tp-essayDimensionMax' }, ` / 5 ${t('essayDimensionUnit')}`),
            ),
          )),
        ),
        h('h3', { className: 'tp-essaySectionTitle' }, t('essayParagraphFeedbackTitle')),
        h(
          'div',
          { className: 'tp-essayParagraphList' },
          data.paragraph_feedback.map((item, index) => h(
            'article',
            { className: 'tp-essayParagraph', key: index },
            h(
              'div',
              { className: 'tp-essayParagraphHead' },
              h(
                'span',
                { className: 'tp-essayParagraphIndex' },
                `${t('essayParagraphPrefix')} ${item.paragraph_index} ${t('essayParagraphSuffix')}`.trim(),
              ),
            ),
            h('div', { className: 'tp-essayParagraphOriginalLabel' }, t('essayParagraphOriginal')),
            h('blockquote', { className: 'tp-essayExcerpt' }, item.original_text),
            h(
              'p',
              { className: 'tp-essayFeedbackLine' },
              h('strong', null, `${t('essayParagraphCritique')}：`),
              item.paragraph_critique,
            ),
            h(
              'div',
              { className: 'tp-essayRewriteBlock' },
              h('div', { className: 'tp-essayRewriteLabel' }, t('essayParagraphRewriteLabel')),
              h('p', { className: 'tp-essayRewriteText' }, item.rewritten_paragraph),
            ),
          )),
        ),
        score.recordError
          ? h(
              'p',
              { className: 'tp-essayArchiveError' },
              `${t('essayRecordFailed')}${score.recordError.message || ''}`,
            )
          : null,
        score.provider
          ? h(
              'div',
              { className: 'tp-essayProvider' },
              `${t('essayModelLine')} · ${score.provider.name || 'DeepSeek'} / ${score.model}`,
            )
          : null,
      )
    }
    function EssayCategoryCard(props) {
      const { category, stat, recommended, maxCount, loading, t, onStart } = props
      const isRecommended = recommended !== null && recommended.category === category.id
      const badge = isRecommended
        ? recommended.reason === 'unpracticed'
          ? t('essayRecommended')
          : t('essayWeakArea')
        : null
      const count = stat?.count ?? 0
      const average = stat?.averageScore
      const progress = maxCount <= 0 || count === 0
        ? 0
        : Math.max(4, Math.round((count / maxCount) * 100))

      return h(
        'article',
        {
          className: isRecommended
            ? 'tp-essayCategoryCard tp-essayCategoryCardRecommended'
            : 'tp-essayCategoryCard',
        },
        h(
          'div',
          { className: 'tp-essayCategoryTop' },
          h('span', { className: 'tp-essayCategoryCode' }, category.id),
          badge === null ? null : h('span', { className: 'tp-essayCategoryBadge' }, badge),
        ),
        h('h3', { className: 'tp-essayCategoryTitle' }, category.zh),
        h('p', { className: 'tp-essayCategoryEn' }, category.en),
        h('p', { className: 'tp-essayCategoryDesc' }, t(category.descKey)),
        h(
          'div',
          { className: 'tp-essayCategoryStats' },
          h(
            'div',
            null,
            h('span', { className: 'tp-essayCategoryStatLabel' }, t('essayPracticeCount')),
            h(
              'strong',
              { className: 'tp-essayCategoryStatValue' },
              loading ? '…' : String(count),
            ),
          ),
          h(
            'div',
            null,
            h('span', { className: 'tp-essayCategoryStatLabel' }, t('essayAverageScore')),
            h(
              'strong',
              { className: 'tp-essayCategoryStatValue' },
              loading
                ? '…'
                : average === null || average === undefined
                  ? '—'
                  : `${average.toFixed(1)} / 20`,
            ),
          ),
        ),
        h(
          'div',
          { className: 'tp-essayCategoryProgress', 'aria-hidden': true },
          h('span', { style: { width: `${progress}%` } }),
        ),
        h(
          'button',
          {
            className: 'tp-btn tp-essayCategoryStart',
            type: 'button',
            onClick: () => onStart(category.id),
          },
          t('essayStartPractice'),
        ),
      )
    }

    function EssayView(props) {
      const { ctx, embedded = false, onSendSampleToTyping } = props
      const t = useT(ctx)
      const [topic, setTopic] = useState({
        status: 'idle',
        data: null,
        error: null,
        provider: null,
        model: null,
      })
      const [essay, setEssay] = useState('')
      const [score, setScore] = useState({
        status: 'idle',
        data: null,
        error: null,
        provider: null,
        model: null,
        recorded: null,
        recordError: null,
      })
      const [view, setView] = useState('board')
      const [selectedCategory, setSelectedCategory] = useState(null)
      const [stats, setStats] = useState({
        status: 'loading',
        data: null,
        error: null,
      })
      const [sample, setSample] = useState({
        status: 'idle',
        data: null,
        error: null,
      })
      const [sampleOpen, setSampleOpen] = useState(false)
      const [archiveId, setArchiveId] = useState(null)
      const topicAbortRef = useRef(null)
      const scoreAbortRef = useRef(null)
      const sampleAbortRef = useRef(null)

      const loadStats = useCallback(async () => {
        setStats((current) => ({
          status: current.data === null ? 'loading' : current.status,
          data: current.data,
          error: null,
        }))
        try {
          const data = await requestJson('/essay/stats')
          if (data?.ok === false) throw new Error(data?.error?.message || t('essayStatsError'))
          setStats({
            status: 'ready',
            data: assertEssayStatsPayload(data),
            error: null,
          })
        } catch (error) {
          setStats((current) => ({
            status: 'error',
            data: current.data,
            error: {
              code: error?.code || 'ESSAY_STATS_FAILED',
              message: error?.message || t('essayStatsError'),
            },
          }))
        }
      }, [t])

      const wordCount = essay.trim().length === 0
        ? 0
        : essay.trim().split(/\s+/).filter(Boolean).length
      const canSubmit = topic.status === 'ready'
        && essay.trim().length >= 20
        && score.status !== 'loading'
        && score.status !== 'ready'

      useEffect(() => {
        void loadStats()
      }, [loadStats])

      useEffect(() => () => {
        if (topicAbortRef.current !== null) topicAbortRef.current.abort()
        if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()
        if (sampleAbortRef.current !== null) sampleAbortRef.current.abort()
      }, [])

      const generateTopic = useCallback(async (category = selectedCategory) => {
        if (!category) return
        const previousTopic = topicAbortRef.current
        if (previousTopic !== null) previousTopic.abort()
        if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()
        if (sampleAbortRef.current !== null) sampleAbortRef.current.abort()
        setSample({ status: 'idle', data: null, error: null })
        setSampleOpen(false)
        setArchiveId(null)

        const controller = new AbortController()
        topicAbortRef.current = controller
        setTopic({ status: 'loading', data: null, error: null, provider: null, model: null })
        setScore({
          status: 'idle',
          data: null,
          error: null,
          provider: null,
          model: null,
          recorded: null,
          recordError: null,
        })
        setEssay('')

        try {
          const data = await requestJson('/essay/topic', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ category }),
            signal: controller.signal,
          })
          if (controller.signal.aborted) return
          const topicData = assertEssayTopicPayload(data?.topic)
          setTopic({
            status: 'ready',
            data: topicData,
            error: null,
            provider: data?.provider || null,
            model: data?.model || null,
          })
        } catch (error) {
          if (controller.signal.aborted || error?.name === 'AbortError') return
          setTopic({
            status: 'error',
            data: null,
            error: {
              code: error?.code || 'ESSAY_TOPIC_FAILED',
              message: error?.message || t('essayTopicError'),
            },
            provider: null,
            model: null,
          })
        } finally {
          if (topicAbortRef.current === controller) topicAbortRef.current = null
        }
      }, [selectedCategory, t])

      const regenerateTopic = useCallback(() => {
        if (
          (essay.trim().length > 0 || score.status === 'ready')
          && !window.confirm(t('essayRegenerateConfirm'))
        ) {
          return
        }
        void generateTopic(selectedCategory)
      }, [essay, score.status, generateTopic, selectedCategory, t])

      const startPractice = useCallback((category) => {
        setSelectedCategory(category)
        setView('practice')
        void generateTopic(category)
      }, [generateTopic])

      const returnToBoard = useCallback(() => {
        if (
          essay.trim().length > 0
          && score.status !== 'ready'
          && !window.confirm(t('essayLeaveConfirm'))
        ) {
          return
        }
        if (topicAbortRef.current !== null) topicAbortRef.current.abort()
        if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()
        setView('board')
        void loadStats()
      }, [essay, score.status, loadStats, t])

      const generateSample = useCallback(async () => {
        if (topic.status !== 'ready' || !topic.data) return
        if (sampleAbortRef.current !== null) sampleAbortRef.current.abort()
        const controller = new AbortController()
        sampleAbortRef.current = controller
        setSampleOpen(true)
        setSample({ status: 'loading', data: null, error: null })
        try {
          const data = await requestJson('/essay/sample', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              topic_id: topic.data.topic_id,
              topic_prompt: topic.data.topic_prompt,
              category: selectedCategory,
            }),
            signal: controller.signal,
          })
          if (controller.signal.aborted) return
          const nextSample = {
            ...assertEssaySamplePayload(data?.sample),
            strategy: typeof data?.strategy === 'string' ? data.strategy : '',
          }
          setSample({
            status: 'ready',
            data: nextSample,
            error: null,
          })
          if (archiveId !== null) {
            void requestJson('/essay/archive/attach-sample', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                archive_id: archiveId,
                sample_essay: nextSample.essay_text,
                sample_translation: nextSample.translation,
                sample_core_argument: nextSample.core_argument ?? '',
                sample_highlights: nextSample.highlights,
                sample_strategy: nextSample.strategy,
              }),
            }).catch(() => {})
          }
        } catch (error) {
          if (controller.signal.aborted || error?.name === 'AbortError') return
          setSample({
            status: 'error',
            data: null,
            error: {
              code: error?.code || 'ESSAY_SAMPLE_FAILED',
              message: error?.message || t('essaySampleError'),
            },
          })
        } finally {
          if (sampleAbortRef.current === controller) sampleAbortRef.current = null
        }
      }, [topic.status, topic.data, selectedCategory, archiveId, t])

      const openSample = useCallback(() => {
        if (sample.status === 'ready' || sample.status === 'error') {
          setSampleOpen(true)
          return
        }
        void generateSample()
      }, [sample.status, generateSample])

      const importSample = useCallback((data) => {
        if (typeof onSendSampleToTyping !== 'function') return false
        const title = topic.data?.topic_id
          ? `${t('essaySampleTypingTitle')} · ${topic.data.topic_id}`
          : t('essaySampleTypingTitle')
        return onSendSampleToTyping({ title, text: data.essay_text })
      }, [onSendSampleToTyping, t, topic.data])

      const submitEssay = useCallback(async () => {
        if (topic.status !== 'ready' || essay.trim().length < 20 || !selectedCategory) return
        if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()

        const controller = new AbortController()
        scoreAbortRef.current = controller
        setScore({
          status: 'loading',
          data: null,
          error: null,
          provider: null,
          model: null,
          recorded: null,
          recordError: null,
        })

        try {
          const data = await requestJson('/essay/score', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              category: selectedCategory,
              topic_prompt: topic.data.topic_prompt,
              essay,
              drawing_svg: topic.data?.drawing_svg ?? '',
              sample_essay: sample.status === 'ready' ? sample.data?.essay_text ?? null : null,
              sample_translation: sample.status === 'ready' ? sample.data?.translation ?? '' : '',
              sample_core_argument: sample.status === 'ready' ? sample.data?.core_argument ?? '' : '',
              sample_highlights: sample.status === 'ready' ? sample.data?.highlights ?? [] : [],
              sample_strategy: sample.status === 'ready' ? sample.data?.strategy ?? '' : '',
            }),
            signal: controller.signal,
          })
          if (controller.signal.aborted) return
          const scoreData = assertEssayScorePayload(data?.score)
          setScore({
            status: 'ready',
            data: scoreData,
            error: null,
            provider: data?.provider || null,
            model: data?.model || null,
            recorded: data?.recorded === true,
            recordError: data?.recordError || null,
          })
          setArchiveId(typeof data?.archive_id === 'string' ? data.archive_id : null)
          if (data?.recorded === true) void loadStats()
        } catch (error) {
          if (controller.signal.aborted || error?.name === 'AbortError') return
          setScore({
            status: 'error',
            data: null,
            error: {
              code: error?.code || 'ESSAY_SCORE_FAILED',
              message: error?.message || t('essayScoreError'),
            },
            provider: null,
            model: null,
            recorded: null,
            recordError: null,
          })
        } finally {
          if (scoreAbortRef.current === controller) scoreAbortRef.current = null
        }
      }, [topic, essay, selectedCategory, sample, loadStats, t])

      function handleEssayChange(event) {
        setEssay(event.target.value)
        if (score.status !== 'idle') {
          setScore({
            status: 'idle',
            data: null,
            error: null,
            provider: null,
            model: null,
            recorded: null,
            recordError: null,
          })
        }
      }

      const topicButtonLabel = topic.status === 'loading'
        ? t('essayGenerating')
        : topic.data
          ? t('essayRegenerate')
          : t('essayGenerate')

      const statsMap = new Map(
        (stats.data?.categories ?? []).map((item) => [item.category, item]),
      )
      const maxCount = Math.max(1, ...(stats.data?.categories ?? []).map((item) => item.count))
      const totalAttempts = stats.data?.totalAttempts ?? 0
      const overallAverage = totalAttempts === 0
        ? null
        : (
            (stats.data.categories.reduce(
              (sum, item) => sum + (item.averageScore ?? 0) * item.count,
              0,
            ) / totalAttempts).toFixed(1)
          )
      const recommended = stats.data?.recommended ?? null

      if (view === 'archive') {
        return h(
          'div',
          {
            className: embedded
              ? 'tp-root tp-essayRoot tp-embeddedRoot'
              : 'tp-root tp-essayRoot',
          },
          h(
            'header',
            { className: embedded ? 'tp-header tp-headerEmbedded' : 'tp-header' },
            h(
              'div',
              { className: 'tp-headerActions' },
              h(
                'button',
                {
                  className: 'tp-btn tp-essayBackButton',
                  type: 'button',
                  onClick: () => setView('board'),
                },
                t('essayBackToBoard'),
              ),
            ),
          ),
          h(EssayArchiveView, {
            ctx,
            onImportSample: (payload) => (
              typeof onSendSampleToTyping === 'function'
                ? onSendSampleToTyping(payload)
                : false
            ),
          }),
        )
      }

      return h(
        'div',
        {
          className: embedded
            ? 'tp-root tp-essayRoot tp-embeddedRoot'
            : 'tp-root tp-essayRoot',
        },
        h(
          'header',
          { className: embedded ? 'tp-header tp-headerEmbedded' : 'tp-header' },
          embedded
            ? null
            : h(
                'div',
                { className: 'tp-heading' },
                h('h1', { className: 'tp-title' }, t('essayTitle')),
                h('p', { className: 'tp-subtitle' }, t('essaySubtitle')),
              ),
          h(
            'div',
            { className: 'tp-headerActions' },
            view === 'board'
              ? h(
                  React.Fragment,
                  null,
                  h(
                    'button',
                    {
                      className: 'tp-btn',
                      type: 'button',
                      onClick: () => setView('archive'),
                    },
                    t('essayArchiveEntry'),
                  ),
                  h(
                    'button',
                    {
                      className: 'tp-btn',
                      type: 'button',
                      disabled: stats.status === 'loading',
                      onClick: loadStats,
                    },
                    t('essayRefreshStats'),
                  ),
                )
              : view === 'archive'
                ? h(
                    'button',
                    {
                      className: 'tp-btn tp-essayBackButton',
                      type: 'button',
                      onClick: () => setView('board'),
                    },
                    t('essayBackToBoard'),
                  )
                : h(
                    React.Fragment,
                    null,
                    h(
                      'button',
                      {
                        className: 'tp-btn tp-essayBackButton',
                        type: 'button',
                        onClick: returnToBoard,
                      },
                      t('essayBackToBoard'),
                    ),
                    h(
                      'button',
                      {
                        className: 'tp-btn',
                        type: 'button',
                        disabled: topic.status === 'loading',
                        onClick: topic.data ? regenerateTopic : () => generateTopic(selectedCategory),
                      },
                      topicButtonLabel,
                    ),
                  ),
          ),
        ),
        view === 'board'
          ? h(
              'div',
              { className: 'tp-essayBoard' },
              h(
                'div',
                { className: 'tp-essayBoardIntro' },
                h('h2', { className: 'tp-essayBoardTitle' }, t('essayBoardTitle')),
                h('p', { className: 'tp-essayBoardSubtitle' }, t('essayBoardSubtitle')),
                stats.data === null
                  ? null
                  : h(
                      'p',
                      { className: 'tp-essayBoardSummary' },
                      `${t('essayTotalPractice')} ${totalAttempts} · ${t('essayOverallAverage')} ${overallAverage === null ? '—' : `${overallAverage} / 20`}`,
                    ),
              ),
              stats.status === 'error'
                ? h(
                    'div',
                    { className: 'tp-alert' },
                    h(
                      'div',
                      { className: 'tp-alertText' },
                      h('div', null, stats.error?.message || t('essayStatsError')),
                    ),
                    h(
                      'button',
                      { className: 'tp-btn', type: 'button', onClick: loadStats },
                      t('essayStatsRetry'),
                    ),
                  )
                : null,
              stats.status === 'loading'
                ? h('div', { className: 'tp-essayStatsLoading' }, t('essayStatsLoading'))
                : null,
              h(
                'div',
                { className: 'tp-essayCategoryGrid' },
                ESSAY_CATEGORIES.map((category) => h(EssayCategoryCard, {
                  key: category.id,
                  category,
                  stat: statsMap.get(category.id) ?? null,
                  recommended,
                  maxCount,
                  loading: stats.status === 'loading',
                  t,
                  onStart: startPractice,
                })),
              ),
            )
          : h(
              React.Fragment,
              null,
              selectedCategory !== null && ESSAY_CATEGORY_MAP[selectedCategory]
                ? h(
                    'div',
                    {
                      className: 'tp-essayPracticeCategory',
                      'data-category': selectedCategory,
                    },
                    h('span', { className: 'tp-essayPracticeCategoryId' }, selectedCategory),
                    h(
                      'span',
                      null,
                      `${ESSAY_CATEGORY_MAP[selectedCategory].zh} · ${ESSAY_CATEGORY_MAP[selectedCategory].en}`,
                    ),
                  )
                : null,
              topic.status === 'error'
          ? h(
              'div',
              { className: 'tp-alert' },
              h(
                'div',
                { className: 'tp-alertText' },
                h('div', null, topic.error?.message || t('essayTopicError')),
                h('div', { className: 'tp-alertHint' }, t('essayErrorHint')),
              ),
              h(
                'button',
                { className: 'tp-btn', type: 'button', onClick: () => generateTopic(selectedCategory) },
                t('essayRetryTopic'),
              ),
            )
          : null,
        topic.status === 'idle'
          ? h(
              'div',
              { className: 'tp-essayEmpty' },
              h('div', { className: 'tp-essayEmptyIcon' }, '✎'),
              h('h2', { className: 'tp-essayEmptyTitle' }, t('essayEmptyTitle')),
              h('p', { className: 'tp-essayEmptyBody' }, t('essayEmptyBody')),
              h(
                'button',
                { className: 'tp-btn', type: 'button', onClick: () => generateTopic(selectedCategory) },
                t('essayGenerate'),
              ),
            )
          : topic.status === 'loading'
            ? h(
                'div',
                { className: 'tp-essayEmpty tp-essayLoading' },
                h('div', { className: 'tp-quizSpinner' }),
                h('div', { className: 'tp-quizLoadingText' }, t('essayGenerating')),
                h('div', { className: 'tp-quizLoadingHint' }, t('essayTopicLoadingHint')),
              )
            : topic.status === 'ready' && topic.data
              ? h(
                  'div',
                  { className: 'tp-essayGrid' },
                  h(
                    'div',
                    { className: 'tp-essayCol' },
                    h(
                      'section',
                      { className: 'tp-card tp-essayDrawingCard' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayDrawingLabel')),
                        h('span', { className: 'tp-cardMeta' }, t('essayDrawingHint')),
                      ),
                      h(
                        'div',
                        { className: 'tp-essayDrawingBody' },
                        h('div', {
                          className: 'tp-essayDrawingSvg',
                          dangerouslySetInnerHTML: { __html: topic.data.drawing_svg },
                        }),
                      ),
                    ),
                    h(
                      'section',
                      { className: 'tp-card' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayTopicLabel')),
                        h('span', { className: 'tp-cardMeta' }, topic.data.topic_id),
                      ),
                      h(
                        'div',
                        { className: 'tp-essayTopicBody' },
                        h('p', { className: 'tp-essayPrompt' }, topic.data.topic_prompt),
                      ),
                    ),
                    h(
                      'section',
                      { className: 'tp-card' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayVocabularyLabel')),
                        h('span', { className: 'tp-cardMeta' }, String(topic.data.related_vocabulary.length)),
                      ),
                      h(
                        'div',
                        { className: 'tp-essayMaterialBody tp-essayScroll tp-essayVocabScroll' },
                        h(
                          'div',
                          { className: 'tp-essayVocabGrid' },
                          topic.data.related_vocabulary.map((item, index) => h(
                            'div',
                            { className: 'tp-essayVocab', key: index },
                            h('span', { className: 'tp-essayWord' }, item.word),
                            h('span', { className: 'tp-essayMeaning' }, item.meaning),
                          )),
                        ),
                      ),
                    ),
                    h(
                      'section',
                      { className: 'tp-card' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayExpressionsLabel')),
                        h('span', { className: 'tp-cardMeta' }, String(topic.data.useful_expressions.length)),
                      ),
                      h(
                        'div',
                        { className: 'tp-essayMaterialBody tp-essayScroll tp-essayExpressionScroll' },
                        h(
                          'div',
                          { className: 'tp-essayExpressionList' },
                          topic.data.useful_expressions.map((item, index) => h(
                            'div',
                            { className: 'tp-essayExpression', key: index },
                            h(
                              'div',
                              { className: 'tp-essayExpressionHead' },
                              h('span', { className: 'tp-essayExpressionText' }, item.expression),
                              h(
                                'span',
                                { className: 'tp-essayPosition' },
                                essayPositionLabel(t, item.position),
                              ),
                            ),
                            h('p', { className: 'tp-essayExpressionMeaning' }, item.meaning),
                          )),
                        ),
                      ),
                    ),
                    h(
                      'section',
                      { className: 'tp-card' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayBackgroundLabel')),
                        h('span', { className: 'tp-cardMeta' }, String(topic.data.cultural_background.length)),
                      ),
                      h(
                        'div',
                        { className: 'tp-essayMaterialBody tp-essayScroll tp-essayBackgroundScroll' },
                        h(
                          'ul',
                          { className: 'tp-essayBackgroundList' },
                          topic.data.cultural_background.map((sentence, index) => h(
                            'li',
                            { key: index },
                            sentence,
                          )),
                        ),
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'tp-essayCol' },
                    h(
                      'section',
                      { className: 'tp-card tp-essayWriteCard' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayWritingLabel')),
                        h('span', { className: 'tp-cardMeta' }, t('essayWordTarget')),
                      ),
                      h(
                        'div',
                        { className: 'tp-essayWriteBody' },
                        h('textarea', {
                          className: 'tp-essayTextarea',
                          value: essay,
                          onChange: handleEssayChange,
                          placeholder: t('essayPlaceholder'),
                          spellCheck: false,
                          autoCapitalize: 'off',
                          autoCorrect: 'off',
                          autoComplete: 'off',
                          maxLength: 12000,
                          'aria-label': t('essayWritingLabel'),
                        }),
                        h(
                          'div',
                          { className: 'tp-essayWriteFooter' },
                          h(
                            'div',
                            { className: 'tp-essayWordCount' },
                            h('strong', null, String(wordCount)),
                            ` ${t('essayWordUnit')} · ${t('essayWordTarget')}`,
                          ),
                          h(
                            'button',
                            {
                              className: 'tp-btn tp-essaySampleBtn',
                              type: 'button',
                              disabled: topic.status !== 'ready' || sample.status === 'loading',
                              onClick: openSample,
                            },
                            sample.status === 'loading'
                              ? t('essaySampleGeneratingShort')
                              : t('essaySampleButton'),
                          ),
                          h(
                            'button',
                            {
                              className: 'tp-btn',
                              type: 'button',
                              disabled: !canSubmit,
                              title: canSubmit ? undefined : t('essayScoreNeedText'),
                              onClick: submitEssay,
                            },
                            score.status === 'loading' ? t('essayScoring') : t('essaySubmit'),
                          ),
                        ),
                        h('div', { className: 'tp-essayHint' }, t('essayWritingHint')),
                      ),
                    ),
                    h(
                      'section',
                      { className: 'tp-card tp-essayScoreCard' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('essayResultTitle')),
                        score.status === 'ready'
                          ? h('span', { className: 'tp-cardMeta' }, `${score.data.total_score} / 20`)
                          : null,
                      ),
                      h(
                        'div',
                        { className: 'tp-essayScoreBody' },
                        h(EssayScorePanel, {
                          score,
                          t,
                          onRetry: submitEssay,
                          canRetry: canSubmit,
                        }),
                      ),
                    ),
                  ),
                )
              : null,
            ),
        sampleOpen
          ? h(EssaySampleModal, {
              t,
              state: sample,
              onClose: () => setSampleOpen(false),
              onRetry: generateSample,
              onImport: importSample,
            })
          : null,
      )
    }

module.exports = { EssayWorkspace: EssayView }
