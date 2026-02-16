import Card from "src/components/ui/Card";
import CardHeader from "src/components/ui/CardHeader";
import { getTrashSchedule } from "src/server/actions/trash";

export default async function TrashCard() {
  const result = await getTrashSchedule();

  return (
    <Card>
      <CardHeader icon="delete" title="Trash Schedule" />
      <div className="flex flex-col gap-1.5">
        {result.error && (
          <p>{result.error}</p>
        )}
        {!result.error && result.data && result.data.length === 0 && (
          <p>Could not find a trash schedule</p>
        )}
        {!result.error && result.data && result.data.length > 0 && (
          result.data.map((trashType) => (
            <div key={trashType.name} className="flex items-center gap-2 ml-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: trashType.color }}></span>
              <p>
                {trashType.name}
              </p>
              <div className="ml-auto flex flex-col items-center justify-center gap-0 bg-(--surface-muted) px-2 py-1 rounded-md min-w-18 text-sm text-(--text-subtle)" >
                {trashType.daysUntilNextPickup === 0 ? (
                  <p>Today</p>
                ) : (
                  <p>{trashType.daysUntilNextPickup} {trashType.daysUntilNextPickup !== 1 ? 'days' : 'day'}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
