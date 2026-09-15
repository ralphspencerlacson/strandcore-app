import { useLayoutEffect } from 'react'

export function useScrollToTopOnReload() {
  useLayoutEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (navigation?.type !== 'reload') return

    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    // Remove an old section anchor so it cannot override the reload position.
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search)
    const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    reset()
    const frame = requestAnimationFrame(reset)
    window.addEventListener('load', reset, { once: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('load', reset)
      history.scrollRestoration = previousRestoration
    }
  }, [])
}
