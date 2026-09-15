import { useEffect, useRef } from 'react'

// Only enhance content after the observer is ready; the page stays readable
// without animations, and each element is revealed just once.
export function useScrollReveal(reducedMotion: boolean) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reducedMotion || !root.current || !('IntersectionObserver' in window)) return

    const elements = Array.from(root.current.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(entries => {
      let stagger = 0
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        element.style.setProperty('--reveal-delay', `${Math.min(stagger++, 3) * 65}ms`)
        element.dataset.revealState = 'visible'
        observer.unobserve(element)
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' })

    for (const element of elements) {
      // Content above the restored scroll position should never disappear.
      if (element.getBoundingClientRect().bottom < 0) continue
      element.dataset.revealState = 'pending'
      observer.observe(element)
    }

    function revealFocusedContent(event: FocusEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const element = target.closest<HTMLElement>('[data-reveal]')
      if (!element) return
      element.style.setProperty('--reveal-delay', '0ms')
      element.dataset.revealState = 'visible'
      observer.unobserve(element)
    }

    const container = root.current
    container.addEventListener('focusin', revealFocusedContent)
    return () => {
      observer.disconnect()
      container.removeEventListener('focusin', revealFocusedContent)
      for (const element of elements) {
        delete element.dataset.revealState
        element.style.removeProperty('--reveal-delay')
      }
    }
  }, [reducedMotion])

  return root
}
