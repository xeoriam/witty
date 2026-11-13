window.__TP_ERRORS__ = []
window.addEventListener('error', (event) => {
  window.__TP_ERRORS__.push(String(event.message ?? event.error ?? 'error'))
})
window.addEventListener('unhandledrejection', (event) => {
  window.__TP_ERRORS__.push(String(event.reason ?? 'unhandled rejection'))
})
