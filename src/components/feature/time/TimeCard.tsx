import Card from 'src/components/ui/Card'
import { getUserLocation } from 'src/server/actions/location';
import Time from './Time';

export default async function TimeCard() {
  const now = new Date();
  const location = await getUserLocation();

  // TODO: replace with date-fns once npm is safe again
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
  const date = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const weekNumber = getWeekNumber(now);

  return (
    <Card className='flex gap-5 items-center'>
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
    </Card>
  )
}
