const React = require('react')
const h = React.createElement
const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React
const NS = 'typing-practice'
const API_BASE = '/plugins/witty'

    function useT(ctx) {
      const t = useMemo(() => ctx.locale.bind(NS), [ctx])
      const [, setRevision] = useState(0)
      useEffect(() => ctx.locale.subscribe(() => setRevision((value) => value + 1)), [ctx])
      return t
    }
    async function requestJson(path, options) {
      const settings = options || {}
      const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'same-origin',
        cache: 'no-store',
        ...settings,
        headers: { ...(settings.headers || {}) },
      })

      let data
      try {
        data = await response.json()
      } catch {
        data = undefined
      }

      if (!response.ok) {
        const error = new Error(data?.error?.message || `请求失败（HTTP ${response.status}）。`)
        error.code = data?.error?.code || `HTTP_${response.status}`
        error.status = response.status
        throw error
      }
      return data
    }

module.exports = {
  React, h, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
  NS, API_BASE, useT, requestJson,
}
