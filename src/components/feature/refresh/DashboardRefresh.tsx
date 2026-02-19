'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRefresh() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      console.log("Refreshing dashboard...")
      router.refresh()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(id)
  }, [router])

  return null
}
