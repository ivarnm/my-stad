import { useEffect, useState } from 'react';
import { getClosestTransitStops, TransitStop } from 'src/server/actions/transit';
import { Result } from 'src/server/actions/types';

interface TransitStopSelectorProps {
  lat: string;
  long: string;
  selectedStops: string[];
  onStopChange: (stop: TransitStop) => void;
}

export default function TransitStopSelector({ lat, long, selectedStops, onStopChange }: TransitStopSelectorProps) {
  const [availableStopsResult, setAvailableStopsResult] = useState<Result<TransitStop[]> | undefined>();

  useEffect(() => {
    const fetchStops = async () => {
      const latNum = parseFloat(lat);
      const longNum = parseFloat(long);
      if (!isNaN(latNum) && !isNaN(longNum)) {
        setAvailableStopsResult(undefined);
        const result = await getClosestTransitStops(latNum, longNum);
        setAvailableStopsResult(result);
      }
    };

    const timeoutId = setTimeout(fetchStops, 250);
    return () => clearTimeout(timeoutId);
  }, [lat, long]);

  if (availableStopsResult === undefined) {
    return (
      <div className="flex flex-col gap-2 bg-(--surface-muted) p-2 rounded">
        <p className="text-sm text-(--text-subtle)">Loading stops...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-(--surface-muted) p-2 rounded">
      {availableStopsResult.data?.map(stop => (
        <label key={stop.id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="transitStops"
            value={JSON.stringify(stop)} // TODO: test this
            checked={selectedStops.includes(stop.id)}
            onChange={() => onStopChange(stop)}
            className="accent-(--fill-default)"
          />
          <span className="text-sm">{stop.name} {stop.code ? `(${stop.code})` : ""} - {stop.distance}m</span>
        </label>
      ))}
      {availableStopsResult.data?.length === 0 && (
        <p className="text-sm text-(--text-subtle)">No transit stops found for the given location.</p>
      )}
      {availableStopsResult.error && (
        <p className="text-sm text-(--text-subtle)">Error: {availableStopsResult.error}</p>
      )}
    </div>
  );
}
