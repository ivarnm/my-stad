'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { invalidateCache } from 'src/server/actions/refresh'

export function NightlyReset() {
  const router = useRouter()

  useEffect(() => {
    function msUntilNextMidnight() {
      const now = new Date()
      const next = new Date()
      next.setHours(24, 0, 0, 0)
      return next.getTime() - now.getTime()
    }

    let intervalId: NodeJS.Timeout

    const timeoutId = setTimeout(() => {
      invalidateCache()
      router.refresh()

      // after first run, repeat every 24h
      intervalId = setInterval(() => {
        invalidateCache()
        router.refresh()
      }, 24 * 60 * 60 * 1000)
    }, msUntilNextMidnight())

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [router])

  return null
}
