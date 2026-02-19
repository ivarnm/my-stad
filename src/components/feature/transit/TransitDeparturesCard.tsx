import Card from "src/components/ui/Card";
import CardHeader from "src/components/ui/CardHeader";
import { getTransitStopDepartures } from "src/server/actions/transit";

import TransitDepartureList from "./TransitDepartureList";

export default async function TransitDeparturesCard() {
  const result = await getTransitStopDepartures();

  return (
    <Card className="flex flex-col">
      <CardHeader icon="directions_bus" title="Departures" />
      <div>
        {result.error && (
          <p>{result.error}</p>
        )}
        {!result.error && result.data && result.data.length === 0 && (
          <p>Could not find any departures</p>
        )}
        {!result.error && result.data && result.data.length > 0 && (
          <TransitDepartureList stops={result.data} />
        )}
      </div>
    </Card>
  )
}
