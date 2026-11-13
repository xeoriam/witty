const { h } = require('./shared.js')

    function TypingPracticeIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 20
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('rect', { x: 2.5, y: 5.5, width: 19, height: 13, rx: 2.4 }),
        h('path', { d: 'M6 9.2h.01M9.2 9.2h.01M12.4 9.2h.01M15.6 9.2h.01M18.8 9.2h.01' }),
        h('path', { d: 'M6 12.4h.01M9.2 12.4h.01M15.6 12.4h.01M18.8 12.4h.01' }),
        h('path', { d: 'M8.2 15.4h7.6' }),
      )
    }

module.exports = { LearningAssistantIcon: TypingPracticeIcon }
