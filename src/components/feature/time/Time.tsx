"use client"

import { useEffect, useState } from 'react'

export default function Time({ date }: { date: Date }) {
  const [now, setNow] = useState(date);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <h2 className="text-4xl tabular-nums mb-1">{time}</h2>
  )
}
