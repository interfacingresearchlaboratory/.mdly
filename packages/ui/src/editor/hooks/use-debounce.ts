import { useState, useEffect, useRef, useMemo } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
  options?: { maxWait?: number }
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | undefined
  let maxTimeoutId: NodeJS.Timeout | undefined
  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | undefined

  const cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId)
      maxTimeoutId = undefined
    }
  }

  const invokeFunc = (time: number) => {
    lastInvokeTime = time
    if (lastArgs !== undefined) {
      func(...lastArgs)
    }
  }

  const trailingEdge = (time: number) => {
    timeoutId = undefined
    if (lastCallTime !== undefined && lastArgs !== undefined) {
      invokeFunc(time)
    }
  }

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      (options?.maxWait !== undefined && timeSinceLastInvoke >= options.maxWait)
    )
  }

  const timerExpired = () => {
    const time = Date.now()
    if (shouldInvoke(time)) {
      trailingEdge(time)
      return
    }
    const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime
    const timeWaiting = wait - timeSinceLastCall
    timeoutId = setTimeout(timerExpired, timeWaiting)
  }

  const maxTimerExpired = () => {
    const time = Date.now()
    if (shouldInvoke(time)) {
      trailingEdge(time)
    }
    maxTimeoutId = undefined
  }

  const debounced: T & { cancel: () => void } = (
    (...args: Parameters<T>): void => {
      const time = Date.now()
      const isInvoking = shouldInvoke(time)

      lastCallTime = time
      lastArgs = args

      if (isInvoking && timeoutId === undefined) {
        invokeFunc(time)
        timeoutId = setTimeout(timerExpired, wait)
      } else {
        if (timeoutId === undefined) {
          timeoutId = setTimeout(timerExpired, wait)
        }
      }

      if (options?.maxWait !== undefined && maxTimeoutId === undefined) {
        maxTimeoutId = setTimeout(maxTimerExpired, options.maxWait)
      }
    }
  ) as T & { cancel: () => void }

  debounced.cancel = cancel

  return debounced
}

export function useDebounceCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
  maxWait?: number
) {
  const funcRef = useRef<T | null>(null)
  funcRef.current = fn

  return useMemo(
    () =>
      debounce(
        ((...args: Parameters<T>): void => {
          if (funcRef.current) {
            funcRef.current(...args)
          }
        }) as T,
        ms,
        { maxWait }
      ),
    [ms, maxWait]
  )
}

