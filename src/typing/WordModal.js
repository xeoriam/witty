const { React, h, useEffect, useRef, useState } = require('../shared.js')
const { DICTIONARY_WORKSPACE_KEY } = require('./dictionary-session.js')
const { dictionaryUrl } = require('./word-lookup.js')

const WORD_MODAL_CSS = `
  .tp-wordModalLayer {
    position: fixed;
    inset: 0;
    z-index: 125;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 20px;
  }
  .tp-wordModalBackdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
  }
  .tp-wordModalCard {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(400px, 0.92fr);
    grid-template-rows: auto minmax(0, 1fr);
    width: min(1120px, 96vw);
    height: min(86vh, 900px);
    max-height: calc(100vh - 40px);
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 18px;
    background: var(--dsw-alias-bg-base);
    box-shadow: 0 24px 70px color-mix(in srgb, #000000 42%, transparent);
    color: var(--dsw-alias-label-primary);
  }
  .tp-wordModalClose {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 3;
    width: 28px;
    height: 28px;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 8px;
    background: var(--dsw-alias-bg-base);
    color: var(--dsw-alias-label-secondary);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
  .tp-wordModalClose:hover {
    color: var(--dsw-alias-label-primary);
    border-color: var(--dsw-alias-border-l2);
  }
  .tp-wordModalSummary {
    grid-column: 1 / -1;
    grid-row: 1;
    padding: 20px 24px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
  .tp-wordModalInfo {
    grid-column: 1;
    grid-row: 2;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 18px 24px 24px;
  }
  .tp-wordModalSection {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tp-wordModalSectionTitle {
    margin: 0;
    color: #e6d6b5;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 650;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .tp-wordModalBodyText {
    margin: 0;
    color: rgba(244, 247, 248, 0.82);
    font-size: 13.5px;
    line-height: 1.75;
    white-space: pre-wrap;
  }
  .tp-wordModalCollocations {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
  }
  .tp-wordModalCollocations li {
    padding: 7px 10px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 9px;
    background: rgba(8, 14, 24, 0.42);
    color: rgba(244, 247, 248, 0.84);
    font-size: 12.5px;
    line-height: 1.55;
  }
  .tp-wordModalWord {
    margin: 0;
    padding-right: 32px;
    font-size: 30px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.02em;
    overflow-wrap: anywhere;
  }
  .tp-wordModalPhonetic {
    margin: 6px 0 0;
    color: var(--dsw-alias-label-secondary);
    font-size: 13px;
    line-height: 1.5;
  }
  .tp-wordModalMeaning {
    margin: 12px 0 0;
    padding: 10px 12px;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 10px;
    background: var(--dsw-alias-bg-layer-1);
    font-size: 14px;
    line-height: 1.65;
    white-space: pre-wrap;
  }
  .tp-wordModalStatus {
    margin: 12px 0 0;
    color: var(--dsw-alias-label-secondary);
    font-size: 13px;
    line-height: 1.6;
  }
  .tp-wordModalError {
    margin: 8px 0 0;
    color: var(--dsw-alias-state-error-primary);
    font-size: 12px;
    line-height: 1.55;
  }
  .tp-wordModalActions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
  .tp-wordModalSave {
    border-color: transparent;
    background: var(--dsw-alias-brand-primary);
    color: var(--dsw-alias-bg-base);
    font-weight: 600;
    padding: 7px 13px;
  }
  .tp-wordModalSave:hover:not(:disabled) {
    background: var(--dsw-alias-brand-primary);
    border-color: transparent;
    opacity: .9;
  }
  .tp-wordModalSave:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .tp-wordModalExternal {
    border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1);
    color: var(--dsw-alias-label-primary);
    font-size: 12px;
    padding: 7px 11px;
  }
  .tp-wordModalExternal:hover:not(:disabled) {
    border-color: var(--dsw-alias-brand-primary);
    color: var(--dsw-alias-brand-primary);
    background: var(--dsw-alias-bg-layer-1);
  }
  .tp-wordModalExternal:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .tp-wordModalDictionary {
    grid-column: 2;
    grid-row: 2;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 12px 16px 16px;
    border-top: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.12);
    margin-top: 0;
  }
  .tp-wordModalDictTabs {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 0;
  }
  .tp-wordModalDictTab {
    padding: 6px 11px;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 8px;
    background: var(--dsw-alias-bg-layer-1);
    color: var(--dsw-alias-label-primary);
    font: inherit;
    font-size: 12px;
    line-height: 1.45;
    cursor: pointer;
  }
  .tp-wordModalDictTab:hover:not(:disabled) {
    border-color: var(--dsw-alias-brand-primary);
    color: var(--dsw-alias-brand-primary);
  }
  .tp-wordModalDictTabActive {
    border-color: var(--dsw-alias-brand-primary);
    background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, var(--dsw-alias-bg-layer-1));
    color: var(--dsw-alias-brand-primary);
    font-weight: 600;
  }
  .tp-wordModalDictTab:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .tp-wordModalWebFrame {
    position: relative;
    flex: 1 1 auto;
    min-height: 260px;
    overflow: hidden;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 10px;
    background: #ffffff;
  }
  .tp-wordModalWebHost {
    position: absolute;
    inset: 0;
  }
  .tp-wordModalWebview {
    display: flex;
    width: 100%;
    height: 100%;
    border: 0;
    background: #ffffff;
  }
  .tp-wordModalWebPlaceholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    text-align: center;
    color: var(--dsw-alias-label-secondary);
    font-size: 13px;
    line-height: 1.65;
    background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, #ffffff);
  }
  .tp-wordModalWebNotice {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    text-align: center;
    background: color-mix(in srgb, var(--dsw-alias-bg-base) 86%, transparent);
  }
  .tp-wordModalSpinner {
    width: 22px;
    height: 22px;
    border: 2px solid var(--dsw-alias-border-l2);
    border-top-color: var(--dsw-alias-brand-primary);
    border-radius: 50%;
    animation: tp-spin 800ms linear infinite;
  }
  .tp-wordModalWebText {
    max-width: 460px;
    color: var(--dsw-alias-label-secondary);
    font-size: 12px;
    line-height: 1.6;
  }
  .tp-wordModalWebError {
    max-width: 480px;
    color: var(--dsw-alias-state-error-primary);
    font-size: 12px;
    line-height: 1.6;
  }
  .tp-wordModalWebActions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .tp-wordModalLink {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 7px 11px;
    border: 1px solid var(--dsw-alias-border-l1);
    border-radius: 8px;
    background: var(--dsw-alias-bg-layer-1);
    color: var(--dsw-alias-label-primary);
    font-size: 12px;
    line-height: 1.45;
    text-decoration: none;
  }
  .tp-wordModalLink:hover {
    border-color: var(--dsw-alias-brand-primary);
    color: var(--dsw-alias-brand-primary);
  }
  .tp-wordModalRetry {
    border: none;
    background: transparent;
    color: var(--dsw-alias-brand-primary);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 2px;
  }

  /* Dark glass tier for the word lookup modal. The dictionary content itself
     may be a white web page, but every surrounding surface stays dark. */
  .tp-wordModalCard {
    border-color: rgba(255, 255, 255, 0.22);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(28, 43, 64, 0.96), rgba(10, 18, 32, 0.94)) !important;
    color: #f2f6ff;
  }
  .tp-wordModalClose {
    background: rgba(10, 17, 28, 0.58);
    border-color: rgba(255, 255, 255, 0.22);
    color: rgba(244, 247, 248, 0.72);
  }
  .tp-wordModalClose:hover {
    color: #f4f7f8;
    border-color: rgba(216, 199, 163, 0.62);
  }
  .tp-wordModalWord {
    color: #f4f7f8;
  }
  .tp-wordModalPhonetic {
    color: rgba(244, 247, 248, 0.56);
  }
  .tp-wordModalMeaning {
    background: rgba(7, 13, 23, 0.56) !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    color: #f4f7f8;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
  }
  .tp-wordModalStatus {
    color: rgba(244, 247, 248, 0.62);
  }
  .tp-wordModalError,
  .tp-wordModalWebError {
    color: #ffb3b3;
  }
  .tp-wordModalSave {
    border-color: transparent;
    background: #d8c7a3 !important;
    color: #08111f !important;
  }
  .tp-wordModalSave:hover:not(:disabled) {
    background: #e6d6b5 !important;
    border-color: transparent !important;
  }
  .tp-wordModalExternal {
    background: rgba(8, 14, 24, 0.54) !important;
    border-color: rgba(255, 255, 255, 0.20) !important;
    color: #f4f7f8 !important;
  }
  .tp-wordModalExternal:hover:not(:disabled) {
    background: rgba(28, 44, 66, 0.58) !important;
    border-color: rgba(216, 199, 163, 0.64) !important;
    color: #f4f7f8 !important;
  }
  .tp-wordModalDictionary {
    border-top-color: rgba(255, 255, 255, 0.14);
  }
  .tp-wordModalDictTab {
    background: rgba(8, 14, 24, 0.54);
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(244, 247, 248, 0.78);
  }
  .tp-wordModalDictTab:hover:not(:disabled) {
    border-color: rgba(216, 199, 163, 0.64);
    color: #f4f7f8;
  }
  .tp-wordModalDictTabActive {
    background: rgba(216, 199, 163, 0.16);
    border-color: rgba(216, 199, 163, 0.58);
    color: #e6d6b5;
  }
  .tp-wordModalWebFrame {
    background: #09111d;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .tp-wordModalWebview {
    background: #09111d;
  }
  .tp-wordModalWebPlaceholder {
    color: rgba(244, 247, 248, 0.58);
    background:
      radial-gradient(110% 80% at 15% 0%, rgba(95, 145, 220, 0.16), transparent 60%),
      linear-gradient(145deg, rgba(18, 30, 46, 0.72), rgba(7, 13, 23, 0.64));
  }
  .tp-wordModalWebNotice {
    background: rgba(7, 13, 23, 0.78);
  }
  .tp-wordModalWebText {
    color: rgba(244, 247, 248, 0.62);
  }
  .tp-wordModalSpinner {
    border-color: rgba(255, 255, 255, 0.16);
    border-top-color: #d8c7a3;
  }
  .tp-wordModalLink {
    background: rgba(8, 14, 24, 0.54);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f4f7f8;
  }
  .tp-wordModalLink:hover {
    border-color: rgba(216, 199, 163, 0.64);
    color: #e6d6b5;
  }
  .tp-wordModalRetry {
    color: #e6d6b5;
  }

  @media (max-width: 920px) {
    .tp-wordModalCard {
      display: flex;
      flex-direction: column;
      height: auto;
      max-height: calc(100vh - 40px);
      overflow: auto;
    }
    .tp-wordModalInfo {
      overflow: visible;
      padding-bottom: 18px;
    }
    .tp-wordModalDictionary {
      flex: 0 0 auto;
      min-height: 360px;
      border-left: 0;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .tp-wordModalWebFrame {
      min-height: 320px;
    }
  }

  @media (max-width: 700px) {
    .tp-wordModalLayer { padding: 10px; }
    .tp-wordModalCard {
      width: 100%;
      height: calc(100vh - 20px);
      max-height: calc(100vh - 20px);
    }
    .tp-wordModalSummary { padding: 18px 16px 0; }
    .tp-wordModalDictionary { padding: 0 10px 10px; }
    .tp-wordModalWebFrame { min-height: 220px; }
    .tp-wordModalActions { justify-content: stretch; }
    .tp-wordModalSave,
    .tp-wordModalExternal { flex: 1 1 auto; }
  }
`

const COOKIE_CLEANUP_SCRIPT = `
(function () {
  var KEY = '__dshDictionaryCookieCleanup';
  var KNOWN = [
    '#onetrust-consent-sdk',
    '#onetrust-banner-sdk',
    '#CybotCookiebotDialog',
    '#CybotCookiebotDialogBodyUnderlay',
    '#qc-cmp2-container',
    '#truste-consent-track',
    '[id^="sp_message_container_"]',
    '[class*="cookie-banner" i]',
    '[class*="cookie-consent" i]',
    '[class*="consent-banner" i]',
    '[id*="cookie-banner" i]',
    '[id*="cookie-consent" i]',
    '[aria-label*="cookie" i]',
    '[aria-label*="consent" i]'
  ];

  if (typeof window[KEY] === 'function') {
    window[KEY]();
    return;
  }

  function isBanner(element) {
    if (!(element instanceof HTMLElement)) return false;
    var style = window.getComputedStyle(element);
    var position = style.position;
    var zIndex = parseInt(style.zIndex || '0', 10);
    return position === 'fixed'
      || position === 'sticky'
      || element.getAttribute('role') === 'dialog'
      || element.getAttribute('aria-modal') === 'true'
      || (!isNaN(zIndex) && zIndex >= 100);
  }

  function hide(element) {
    if (element.getAttribute('data-dsh-cookie-hidden') === '1') return;
    element.setAttribute('data-dsh-cookie-hidden', '1');
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('pointer-events', 'none', 'important');
  }

  function cleanup() {
    var known = document.querySelectorAll(KNOWN.join(','));
    for (var i = 0; i < known.length; i += 1) hide(known[i]);

    var candidates = document.querySelectorAll('[id],[class],[aria-label]');
    for (var j = 0; j < candidates.length; j += 1) {
      var element = candidates[j];
      if (element === document.body || element === document.documentElement) continue;
      var fingerprint = String(element.id || '') + ' '
        + String(element.getAttribute('class') || '') + ' '
        + String(element.getAttribute('aria-label') || '');
      if (!/(cookie|consent|gdpr|privacy)/i.test(fingerprint)) continue;
      if (isBanner(element)) hide(element);
    }

    if (document.documentElement) document.documentElement.style.removeProperty('overflow');
    if (document.body) document.body.style.removeProperty('overflow');
  }

  window[KEY] = cleanup;
  cleanup();

  var scheduled = false;
  var observer = new MutationObserver(function () {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      cleanup();
    }, 80);
  });
  observer.observe(document.documentElement || document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'style', 'aria-label']
  });
  window.setTimeout(function () {
    observer.disconnect();
  }, 15000);
})();
`

function DictionaryFallbackLink(props) {
  const { href, label } = props
  if (href === null) return null
  return h(
    'a',
    {
      className: 'tp-wordModalLink',
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    label,
  )
}

function WordModal(props) {
  const { data, t, onClose, onSave, onRetry } = props
  const closeRef = useRef(null)
  const webviewHostRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [dictionary, setDictionary] = useState({
    provider: null,
    url: null,
    loading: false,
    error: null,
    nonce: 0,
  })

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    setDictionary({
      provider: null,
      url: null,
      loading: false,
      error: null,
      nonce: 0,
    })
  }, [data.key])

  useEffect(() => {
    const host = webviewHostRef.current
    if (host === null || dictionary.url === null) return undefined

    const bridge = window.dshDesktop?.browser
    if (
      bridge === undefined
      || bridge === null
      || typeof bridge.acquire !== 'function'
      || typeof bridge.release !== 'function'
    ) {
      setDictionary((current) => (
        current.url === null
          ? current
          : { ...current, loading: false, error: t('wordDictionaryUnsupported') }
      ))
      return undefined
    }

    let cancelled = false
    let element = null
    let lease = null
    let unsubscribeOpen = null
    const url = dictionary.url

    const fail = (message) => {
      if (cancelled) return
      setDictionary((current) => (
        current.url === null
          ? current
          : { ...current, loading: false, error: message || t('wordDictionaryFailed') }
      ))
    }

    const cleanCookies = () => {
      if (cancelled || element === null) return
      element.executeJavaScript(COOKIE_CLEANUP_SCRIPT).catch(() => {})
    }

    const create = async () => {
      try {
        const reservation = await bridge.acquire(DICTIONARY_WORKSPACE_KEY)
        if (cancelled || host === null) {
          await bridge.release(reservation.lease).catch(() => {})
          return
        }

        lease = reservation.lease
        element = document.createElement('webview')
        element.className = 'tp-wordModalWebview'
        element.setAttribute('name', reservation.lease)
        element.setAttribute('partition', reservation.partition)
        element.setAttribute('allowpopups', '')
        element.setAttribute('src', `about:blank#${reservation.lease}`)

        const onStart = () => setDictionary((current) => (
          current.url === null ? current : { ...current, loading: true, error: null }
        ))
        const onStop = () => {
          setDictionary((current) => (
            current.url === null ? current : { ...current, loading: false }
          ))
          cleanCookies()
        }
        const onFinish = () => {
          setDictionary((current) => (
            current.url === null ? current : { ...current, loading: false, error: null }
          ))
          cleanCookies()
        }
        const onNavigate = () => cleanCookies()
        const onFail = (event) => {
          if (event.isMainFrame === false || event.errorCode === -3) return
          fail(event.errorDescription)
        }
        const onReady = () => {
          element.removeEventListener('dom-ready', onReady)
          element.loadURL(url).then(cleanCookies).catch((error) => {
            if (!cancelled) fail(error?.message)
          })
        }

        element.addEventListener('did-start-loading', onStart)
        element.addEventListener('did-stop-loading', onStop)
        element.addEventListener('did-finish-load', onFinish)
        element.addEventListener('did-fail-load', onFail)
        element.addEventListener('did-navigate', onNavigate)
        element.addEventListener('did-navigate-in-page', onNavigate)
        element.addEventListener('dom-ready', onReady)
        element.addEventListener('render-process-gone', () => fail(t('wordDictionaryFailed')))
        element.addEventListener('before-input-event', (event) => {
          if (event.key !== 'Escape' || event.isAutoRepeat) return
          event.preventDefault()
          onCloseRef.current()
        })
        if (typeof bridge.onOpenRequested === 'function') {
          unsubscribeOpen = bridge.onOpenRequested(reservation.lease, (target) => {
            if (cancelled || element === null) return
            setDictionary((current) => (
              current.url === null ? current : { ...current, loading: true, error: null }
            ))
            element.loadURL(target).catch((error) => {
              if (!cancelled) fail(error?.message)
            })
          })
        }

        host.append(element)
      } catch (error) {
        if (!cancelled) fail(error?.message)
      }
    }

    void create()

    return () => {
      cancelled = true
      if (unsubscribeOpen !== null) unsubscribeOpen()
      if (element !== null) element.remove()
      if (lease !== null) {
        void bridge.release(lease).catch(() => {})
      }
    }
  }, [dictionary.url, dictionary.nonce, t])

  const longmanUrl = dictionaryUrl('longman', data.word)
  const oxfordUrl = dictionaryUrl('oxford', data.word)
  const providers = [
    { id: 'longman', label: t('wordLongman'), url: longmanUrl },
    { id: 'oxford', label: t('wordOxford'), url: oxfordUrl },
  ]

  function selectDictionary(provider, url) {
    if (url === null) return
    setDictionary({
      provider,
      url,
      loading: true,
      error: null,
      nonce: 0,
    })
  }

  function retryDictionary() {
    if (dictionary.url === null) return
    setDictionary((current) => ({
      ...current,
      loading: true,
      error: null,
      nonce: current.nonce + 1,
    }))
  }

  function openInBrowser() {
    if (dictionary.url === null) return
    window.open(dictionary.url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return h(
    'div',
    {
      className: 'tp-wordModalLayer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': data.word,
      onClick: onClose,
    },
    h('div', { className: 'tp-wordModalBackdrop', 'aria-hidden': true }),
    h(
      'section',
      {
        className: 'tp-wordModalCard',
        onClick: (event) => event.stopPropagation(),
      },
      h('style', null, WORD_MODAL_CSS),
      h(
        'button',
        {
          ref: closeRef,
          className: 'tp-wordModalClose',
          type: 'button',
          'aria-label': t('wordClose'),
          title: t('wordClose'),
          onClick: onClose,
        },
        '×',
      ),
      h(
        'div',
        { className: 'tp-wordModalSummary' },
        h('h2', { className: 'tp-wordModalWord' }, data.word),
        typeof data.phonetic === 'string' && data.phonetic.trim().length > 0
          ? h('p', { className: 'tp-wordModalPhonetic' }, data.phonetic)
          : null,
        h(
          'div',
          { className: 'tp-wordModalActions' },
          h(
            'button',
            {
              className: 'tp-btn tp-wordModalSave',
              type: 'button',
              disabled: data.status !== 'ready' || data.saving || data.saved,
              onClick: onSave,
            },
            data.saved ? t('wordSaved') : data.saving ? t('wordSaving') : t('wordSave'),
          ),
          h(
            'button',
            {
              className: 'tp-btn tp-wordModalExternal',
              type: 'button',
              disabled: dictionary.url === null,
              title: dictionary.url === null
                ? t('wordSelectDictionary')
                : t('wordOpenExternal'),
              onClick: openInBrowser,
            },
            t('wordOpenExternal'),
          ),
        ),
      ),
      h(
        'div',
        { className: 'tp-wordModalInfo' },
        data.status === 'loading'
          ? h('p', { className: 'tp-wordModalStatus' }, t('wordLookingUp'))
          : data.status === 'error'
            ? h(
                React.Fragment,
                null,
                h('p', { className: 'tp-wordModalError' }, data.error || t('wordLookupFailed')),
                h(
                  'button',
                  { className: 'tp-wordModalRetry', type: 'button', onClick: onRetry },
                  t('wordRetry'),
                ),
              )
            : h(
                React.Fragment,
                null,
                h(
                  'section',
                  { className: 'tp-wordModalSection' },
                  h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordContextMeaning')),
                  h('p', { className: 'tp-wordModalMeaning' }, data.meaning || t('wordNoMeaning')),
                ),
                h(
                  'section',
                  { className: 'tp-wordModalSection' },
                  h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordDefinition')),
                  h('p', { className: 'tp-wordModalBodyText' }, data.definition || t('wordNoDefinition')),
                ),
                h(
                  'section',
                  { className: 'tp-wordModalSection' },
                  h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordCollocations')),
                  Array.isArray(data.collocations) && data.collocations.length > 0
                    ? h(
                        'ul',
                        { className: 'tp-wordModalCollocations' },
                        data.collocations.map((item, itemIndex) => h('li', { key: itemIndex }, item)),
                      )
                    : h('p', { className: 'tp-wordModalBodyText' }, t('wordNoCollocations')),
                ),
                h(
                  'section',
                  { className: 'tp-wordModalSection' },
                  h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordEtymology')),
                  h('p', { className: 'tp-wordModalBodyText' }, data.etymology || t('wordNoEtymology')),
                ),
              ),
        data.saveError
          ? h('p', { className: 'tp-wordModalError' }, data.saveError)
          : null,
      ),
      h(
        'div',
        { className: 'tp-wordModalDictionary' },
        h(
          'div',
          { className: 'tp-wordModalDictTabs' },
          providers.map((provider) => h(
            'button',
            {
              key: provider.id,
              className: dictionary.provider === provider.id
                ? 'tp-wordModalDictTab tp-wordModalDictTabActive'
                : 'tp-wordModalDictTab',
              type: 'button',
              disabled: provider.url === null,
              onClick: () => selectDictionary(provider.id, provider.url),
            },
            provider.label,
          )),
        ),
        h(
          'div',
          { className: 'tp-wordModalWebFrame' },
          dictionary.url === null
            ? h(
                'div',
                { className: 'tp-wordModalWebPlaceholder' },
                h('div', null, t('wordDictionaryHint')),
              )
            : h('div', {
                ref: webviewHostRef,
                className: 'tp-wordModalWebHost',
              }),
          dictionary.loading
            ? h(
                'div',
                { className: 'tp-wordModalWebNotice' },
                h('div', { className: 'tp-wordModalSpinner' }),
                h('div', { className: 'tp-wordModalWebText' }, t('wordDictionaryLoading')),
              )
            : null,
          dictionary.error
            ? h(
                'div',
                { className: 'tp-wordModalWebNotice' },
                h('div', { className: 'tp-wordModalWebError' }, dictionary.error),
                h(
                  'div',
                  { className: 'tp-wordModalWebActions' },
                  h(
                    'button',
                    { className: 'tp-wordModalRetry', type: 'button', onClick: retryDictionary },
                    t('wordDictionaryRetry'),
                  ),
                  h(DictionaryFallbackLink, {
                    href: dictionary.url,
                    label: t('wordOpenExternal'),
                  }),
                ),
              )
            : null,
        ),
      ),
    ),
  )
}

module.exports = { WordModal }
