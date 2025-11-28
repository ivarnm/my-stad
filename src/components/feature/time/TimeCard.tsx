"use client"

import { useEffect, useState } from 'react';
import Card from 'src/components/ui/Card'
import useLocalStorage from 'src/hooks/useLocalStorage';

interface Location {
  address: string;
  lat: number;
  long: number;
}

export default function TimeCard() {
  const [now, setNow] = useState(new Date());
  const [location] = useLocalStorage<Location | null>('location', null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
  const date = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const weekNumber = getWeekNumber(now);

  return (
    <Card className='flex gap-5 items-center'>
      <span className="material-symbols-outlined">
        calendar_today
      </span>
      <div>
        <div className="text-4xl tabular-nums mb-1">{time}</div>
        <div className="text-(--text-subtle)">
          {weekday}, {date} · Week {weekNumber}
        </div>
        <div className="text-(--text-subtle) text-sm mt-1 min-h-5">
          {location?.address && (
            <>
              {location.address}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
