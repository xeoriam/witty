const { React, h } = require('../shared.js')

    function FavoriteButton(props) {
      const { saved, busy, label, t, onCollect } = props
      const text = saved ? t('favoriteSaved') : busy ? t('favoriteSaving') : label || t('favoriteAddSentence')
      return h(
        'button',
        {
          className: saved ? 'tp-btn tp-btnSmall tp-favBtnSaved' : 'tp-btn tp-btnSmall',
          type: 'button',
          disabled: saved === true || busy === true,
          title: text,
          onClick: onCollect,
        },
        saved === true ? '★' : '☆',
        h('span', null, text),
      )
    }
    function SelectionChip(props) {
      const { menu, t, onOpen, onPick, onClose } = props
      const style = { left: `${menu.x}px`, top: `${menu.y}px` }
      const act = (action) => (event) => {
        event.preventDefault()
        event.stopPropagation()
        action()
      }

      if (menu.mode !== 'pick') {
        return h(
          'div',
          { className: 'tp-favFloat', style },
          h(
            'button',
            {
              className: 'tp-btn tp-btnSmall',
              type: 'button',
              onMouseDown: act(onOpen),
            },
            '☆ ',
            t('favoriteAdd'),
          ),
        )
      }

      return h(
        'div',
        { className: 'tp-favFloat', style },
        h('span', { className: 'tp-favPickLabel' }, t('favoritePickType')),
        h(
          'button',
          { className: 'tp-btn tp-btnSmall', type: 'button', onMouseDown: act(() => onPick('word')) },
          t('favoriteTypeWord'),
        ),
        h(
          'button',
          { className: 'tp-btn tp-btnSmall', type: 'button', onMouseDown: act(() => onPick('sentence')) },
          t('favoriteTypeSentence'),
        ),
        h('button', { className: 'tp-favCancel', type: 'button', onMouseDown: act(onClose) }, t('favoriteCancel')),
      )
    }

module.exports = { FavoriteButton, SelectionChip }
