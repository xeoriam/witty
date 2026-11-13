const { React, h, useEffect } = require('../shared.js')

    const QUIZ_TYPE_KEYS = {
      detail: 'quizTypeDetail',
      inference: 'quizTypeInference',
      main_idea: 'quizTypeMainIdea',
      attitude: 'quizTypeAttitude',
      vocabulary: 'quizTypeVocabulary',
    }
    function assertQuizPayload(value) {
      if (!Array.isArray(value) || value.length !== 5) {
        throw new Error('题目数量必须是 5。')
      }

      return value.map((question, index) => {
        if (question === null || typeof question !== 'object' || Array.isArray(question)) {
          throw new Error(`第 ${index + 1} 题不是对象。`)
        }
        if (typeof QUIZ_TYPE_KEYS[question.type] !== 'string') {
          throw new Error(`第 ${index + 1} 题题型无效。`)
        }
        if (typeof question.stem !== 'string' || question.stem.trim().length === 0) {
          throw new Error(`第 ${index + 1} 题缺少题干。`)
        }
        if (!Array.isArray(question.options) || question.options.length !== 4) {
          throw new Error(`第 ${index + 1} 题必须有 4 个选项。`)
        }

        const labels = question.options.map((option) => option?.label)
        if (labels.join('') !== 'ABCD') {
          throw new Error(`第 ${index + 1} 题的选项标签必须按 A/B/C/D 排列。`)
        }
        for (const option of question.options) {
          if (typeof option?.text !== 'string' || option.text.trim().length === 0) {
            throw new Error(`第 ${index + 1} 题有空白选项。`)
          }
        }
        if (!labels.includes(question.answer)) {
          throw new Error(`第 ${index + 1} 题的正确答案不在选项中。`)
        }
        if (typeof question.explanation !== 'string' || question.explanation.trim().length === 0) {
          throw new Error(`第 ${index + 1} 题缺少解析。`)
        }
        if (typeof question.evidence !== 'string' || question.evidence.trim().length === 0) {
          throw new Error(`第 ${index + 1} 题缺少原文依据。`)
        }

        return {
          type: question.type,
          stem: question.stem.trim(),
          options: question.options.map((option) => ({
            label: option.label,
            text: option.text.trim(),
          })),
          answer: question.answer,
          explanation: question.explanation.trim(),
          evidence: question.evidence.trim(),
        }
      })
    }
    function quizTypeLabel(t, type) {
      const key = QUIZ_TYPE_KEYS[type]
      return key === undefined ? type : t(key)
    }
    function QuizQuestionCard(props) {
      const { question, index, selected, submitted, t, onAnswer } = props
      const correct = submitted && selected === question.answer

      return h(
        'article',
        { className: 'tp-quizQuestion' },
        h(
          'div',
          { className: 'tp-quizQHead' },
          h('span', { className: 'tp-quizIndex' }, `${t('quizQuestionLabel')} ${index + 1}`),
          h('span', { className: 'tp-quizType' }, quizTypeLabel(t, question.type)),
          submitted
            ? h(
                'span',
                { className: correct ? 'tp-quizResultOk' : 'tp-quizResultBad' },
                correct ? t('quizCorrect') : t('quizWrong'),
              )
            : null,
        ),
        h('p', { className: 'tp-quizStem' }, question.stem),
        h(
          'div',
          { className: 'tp-quizOptions' },
          question.options.map((option) => {
            const isSelected = selected === option.label
            const isCorrect = submitted && option.label === question.answer
            const isWrong = submitted && isSelected && option.label !== question.answer
            const className = [
              'tp-quizOption',
              !submitted && isSelected ? 'tp-quizOptionSelected' : '',
              isCorrect ? 'tp-quizOptionCorrect' : '',
              isWrong ? 'tp-quizOptionWrong' : '',
            ].filter(Boolean).join(' ')

            return h(
              'label',
              { key: option.label, className },
              h('input', {
                type: 'radio',
                name: `tp-quiz-${index}`,
                value: option.label,
                checked: isSelected,
                disabled: submitted,
                onChange: () => onAnswer(option.label),
              }),
              h('span', { className: 'tp-quizOptionLabel' }, option.label),
              h('span', { className: 'tp-quizOptionText' }, option.text),
            )
          }),
        ),
        submitted
          ? h(
              'div',
              { className: 'tp-quizAnswerBox' },
              h(
                'div',
                { className: 'tp-quizAnswerRow' },
                h('span', { className: 'tp-quizAnswerLabel' }, `${t('quizCorrectAnswer')}：`),
                h('span', { className: 'tp-quizAnswerValue' }, question.answer),
                h(
                  'span',
                  { className: 'tp-quizYourAnswer' },
                  `${t('quizYourAnswer')}：${selected || t('quizNoAnswer')}`,
                ),
              ),
              h(
                'p',
                { className: 'tp-quizExplanation' },
                h('strong', null, `${t('quizExplanation')}：`),
                question.explanation,
              ),
              h(
                'blockquote',
                { className: 'tp-quizEvidence' },
                h('strong', null, `${t('quizEvidence')}：`),
                `“${question.evidence}”`,
              ),
            )
          : null,
      )
    }
    function QuizDrawer(props) {
      const { quiz, answers, submitted, t, onClose, onAnswer, onSubmit, onReset, onGenerate } = props
      const total = quiz.questions.length
      const answered = quiz.questions.filter((_, index) => answers[index] !== undefined).length
      const allAnswered = total > 0 && answered === total
      const score = submitted
        ? quiz.questions.filter((question, index) => answers[index] === question.answer).length
        : 0
      const types = new Set(quiz.questions.map((question) => question.type)).size

      useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [onClose])

      const headerSubtitle = quiz.status === 'ready' && quiz.provider
        ? `${t('quizProvider')}：${quiz.provider.name || 'DeepSeek'} · ${quiz.model}`
        : t('quizSubtitle')

      return h(
        'div',
        { className: 'tp-quizLayer', onMouseUp: (event) => event.stopPropagation() },
        h('div', { className: 'tp-quizBackdrop', onClick: onClose, 'aria-hidden': true }),
        h(
          'section',
          {
            className: 'tp-quizDrawer',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('quizTitle'),
            onClick: (event) => event.stopPropagation(),
          },
          h(
            'header',
            { className: 'tp-quizHeader' },
            h(
              'div',
              { className: 'tp-quizHeaderText' },
              h('h2', { className: 'tp-quizTitle' }, t('quizTitle')),
              h('p', { className: 'tp-quizSubtitle' }, headerSubtitle),
            ),
            h(
              'div',
              { className: 'tp-quizHeaderActions' },
              h(
                'button',
                {
                  className: 'tp-btn tp-btnSmall',
                  type: 'button',
                  disabled: quiz.status === 'loading',
                  onClick: onGenerate,
                },
                t('quizRegenerate'),
              ),
              h(
                'button',
                { className: 'tp-quizClose', type: 'button', autoFocus: true, onClick: onClose },
                t('quizClose'),
              ),
            ),
          ),
          h(
            'div',
            { className: 'tp-quizBody' },
            quiz.status === 'loading'
              ? h(
                  'div',
                  { className: 'tp-quizLoading' },
                  h('div', { className: 'tp-quizSpinner' }),
                  h('div', { className: 'tp-quizLoadingText' }, t('quizLoading')),
                  h('div', { className: 'tp-quizLoadingHint' }, t('quizLoadingHint')),
                )
              : quiz.status === 'error'
                ? h(
                    'div',
                    { className: 'tp-quizErrorBox' },
                    h('div', { className: 'tp-quizErrorTitle' }, t('quizError')),
                    h('div', { className: 'tp-quizErrorText' }, quiz.error?.message || t('quizError')),
                    h('div', { className: 'tp-quizErrorHint' }, t('quizErrorHint')),
                    h(
                      'button',
                      { className: 'tp-btn', type: 'button', onClick: onGenerate },
                      t('quizRetry'),
                    ),
                  )
                : quiz.status === 'ready'
                  ? h(
                      React.Fragment,
                      null,
                      h(
                        'div',
                        { className: 'tp-quizSummary' },
                        h(
                          'span',
                          null,
                          submitted
                            ? `${t('quizScore')}：`
                            : `${answered} / ${total} ${t('quizAnswered')}`,
                        ),
                        h(
                          'strong',
                          null,
                          submitted
                            ? `${score} / ${total}`
                            : `${types} ${t('quizTypeUnit')}`,
                        ),
                      ),
                      quiz.questions.map((question, index) => h(QuizQuestionCard, {
                        key: index,
                        question,
                        index,
                        selected: answers[index],
                        submitted,
                        t,
                        onAnswer: (label) => onAnswer(index, label),
                      })),
                    )
                  : h('div', { className: 'tp-empty' }, t('quizError')),
          ),
          quiz.status === 'ready'
            ? h(
                'footer',
                { className: 'tp-quizFooter' },
                h(
                  'div',
                  { className: 'tp-quizFooterMeta' },
                  submitted
                    ? t('quizAllAnswered')
                    : allAnswered
                      ? t('quizAllAnswered')
                      : h(
                          'span',
                          { className: 'tp-quizNeedAll' },
                          `${total - answered} ${t('quizUnansweredUnit')}`,
                        ),
                ),
                submitted
                  ? h(
                      'button',
                      { className: 'tp-btn', type: 'button', onClick: onReset },
                      t('quizReset'),
                    )
                  : h(
                      'button',
                      {
                        className: 'tp-btn tp-quizSubmit',
                        type: 'button',
                        disabled: !allAnswered,
                        title: allAnswered ? undefined : t('quizNeedAll'),
                        onClick: onSubmit,
                      },
                      t('quizSubmit'),
                    ),
              )
            : null,
        ),
      )
    }

module.exports = { QuizDrawer, assertQuizPayload }
