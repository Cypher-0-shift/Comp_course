import { useState, useEffect, useRef } from 'react'

export interface ContentFitResult {
  ref: React.RefObject<HTMLDivElement | HTMLElement | null>
  isOverflowing: boolean
  containerWidth: number
}

/**
 * useContentFit
 * A performance-optimized hook using ResizeObserver to determine whether content
 * overflows its parent container, enabling adaptive layout or tooltip triggering.
 */
export function useContentFit(): ContentFitResult {
  const ref = useRef<HTMLDivElement | HTMLElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const checkFit = () => {
      const isScrollable = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
      setIsOverflowing(isScrollable)
      setContainerWidth(el.clientWidth)
    }

    checkFit()

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        checkFit()
      })
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  return { ref, isOverflowing, containerWidth }
}
