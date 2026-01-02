import Card from "src/components/ui/Card";
import { getTransitStopDepartures } from "src/server/actions/transit";

export default async function TransitDeparturesCard() {
  const result = await getTransitStopDepartures();
  console.log(result)

  function getDepartureTime(expectedTime: Date) {
    const now = new Date();
    const diffMs = expectedTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins <= 0) {
      return "Now"
    }

    if (diffMins <= 10) {
      return `${diffMins} min`;
    }
    return expectedTime.toLocaleTimeString(["nb-NO"], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <Card className="flex flex-col">
      <div className="flex gap-2 items-center mb-3">
        <span className="material-symbols-outlined text-(--text-subtle)">
          directions_bus
        </span>
        <h2 className="text-xl font-bold">Departures</h2>
      </div>
      <div>
        {result.error && (
          <p>{result.error}</p>
        )}
        {!result.error && result.data && result.data.length === 0 && (
          <p>Could not find a trash schedule</p>
        )}
        {!result.error && result.data && result.data.length > 0 && (
          <div className="flex flex-col gap-6">
            {result.data.map((stop) => (
              <div key={stop.stop.id}>
                <h3 className="text-(--text-subtle) mb-2">{stop.stop.name} {stop.stop.code ? `(${stop.stop.code})` : ""} - {stop.stop.distance}m</h3>
                <div className="flex flex-col gap-3">
                  {stop.departures.length === 0 && (
                    <p className="text-sm text-(--text-subtle)">No upcoming departures</p>
                  )}
                  {stop.departures.length > 0 && (
                    <>
                      {stop.departures.map((departure) => (
                        <div key={departure.lineCode + departure.expectedTime} className="flex gap-4 bg-(--surface-muted) px-3 py-2 rounded-xl items-center">
                          <span className="w-8 bg-(--fill-default) rounded flex items-center justify-center">{departure.lineCode}</span>
                          <span className="flex-1">{departure.name}</span>
                          <span>{getDepartureTime(new Date(departure.expectedTime))}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
