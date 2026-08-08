import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce a value by a specified delay in milliseconds.
 * Useful for preventing rapid re-fetches / re-renders during text input.
 */
export function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
