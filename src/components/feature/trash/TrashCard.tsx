import Card from "src/components/ui/Card";
import { getTrashSchedule } from "src/server/actions/trash";

export default async function TrashCard() {
  const result = await getTrashSchedule();

  return (
    <Card>
      <div className='flex gap-2 items-center mb-3'>
        <span className="material-symbols-outlined text-(--text-subtle)">
          delete
        </span>
        <h2 className="text-xl font-bold">Trash Schedule</h2>
      </div>
      <div className="flex flex-col gap-2">
        {result.error && (
          <p>{result.error}</p>
        )}
        {!result.error && result.data && result.data.length === 0 && (
          <p>Could not find a trash schedule</p>
        )}
        {!result.error && result.data && result.data.length > 0 && (
          result.data.map((trashType) => (
            <div key={trashType.name} className="flex items-center gap-4 ml-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: trashType.color }}></span>
              <p className="text-lg">
                {trashType.name}
              </p>
              <div className="ml-auto flex flex-col items-center justify-center gap-0 bg-(--surface-muted) px-3 py-1 rounded-md min-h-14">
                {trashType.daysUntilNextPickup === 0 ? (
                  <p className="text-(--text-accent) font-medium">Today</p>
                ) : (
                  <>
                    <p className="text-(--text-subtle)">{trashType.daysUntilNextPickup}</p>
                    <p className="text-(--text-subtle) text-sm">{trashType.daysUntilNextPickup !== 1 ? 'days' : 'day'}</p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
