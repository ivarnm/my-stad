"use client";

import { useState } from 'react'
import Time from './Time';
import { UserLocation } from 'src/server/actions/location';
import Dialog from 'src/components/ui/Dialog';
import UserSettings from '../settings/UserSettings';

interface TimeCardContentProps {
  now: Date;
  date: string;
  weekday: string;
  weekNumber: number;
  location: UserLocation | null;
}

export default function TimeCardContent({ now, date, weekday, weekNumber, location }: TimeCardContentProps) {
  const [showDialog, setShowDialog] = useState(location === null);

  return (
    <>
      <button onClick={() => setShowDialog(true)} className='flex gap-5 items-center text-left w-full'>
        <span className="material-symbols-outlined text-(--text-subtle)">
          calendar_today
        </span>
        <div>
          <Time date={now} />
          <p className="text-(--text-subtle)">
            {weekday}, {date} · Week {weekNumber}
          </p>
          <p className="text-(--text-subtle) text-sm mt-1 min-h-5">
            {location?.address ? (
              <>
                {location.address}
              </>
            ) : (
              <>No location set</>
            )}
          </p>
        </div>
      </button>
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="User Settings"
      >
        <UserSettings key={showDialog ? "open" : "closed"} location={location} />
      </Dialog>
    </>
  )
}
