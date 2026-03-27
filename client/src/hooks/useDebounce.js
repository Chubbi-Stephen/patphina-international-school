import { useState, useEffect } from 'react'

/**
 * Returns a debounced version of the given value,
 * only updating after `delay` ms of no changes.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
