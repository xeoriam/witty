const { h, NS } = require('./shared.js')
const { ZH, EN } = require('./locales.js')
const { LearningAssistantIcon } = require('./icons.js')
const { LearningShell } = require('./shell.js')

module.exports = {
  inject: ['slots', 'locale'],
  apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, 'zh', ZH))
    ctx.effect(() => ctx.locale.register(NS, 'en', EN))

    const t = ctx.locale.bind(NS)

    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist',
      id: 'witty',
      order: 20,
      label: () => t('learningAssistantTitle'),
    }, LearningAssistantIcon))

    ctx.slots.inject('main', () => ctx.slots.register({
      name: 'main',
      key: 'witty',
    }, (props) => h(LearningShell, { ...props, ctx })))
  },
}
