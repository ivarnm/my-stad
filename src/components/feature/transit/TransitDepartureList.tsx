"use client";

import { useEffect, useState } from "react";
import { TransitStopDepartures } from "src/server/actions/transit/types";

export default function TransitDepartureList({
  stops,
}: {
  stops: TransitStopDepartures[];
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  function getDepartureTime(expectedTime: Date | string) {
    const time = new Date(expectedTime);
    const diffMs = time.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins <= 0) {
      return "Now";
    }

    if (diffMins <= 10) {
      return `${diffMins} min`;
    }
    return time.toLocaleTimeString(["nb-NO"], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {stops.map((stop) => {
        const departures = stop.departures
          .filter((departure) => new Date(departure.expectedTime) >= now)
          .slice(0, 4);

        return (
          <div key={stop.stop.id}>
            <h3 className="text-(--text-subtle) mb-1">
              {stop.stop.name} {stop.stop.code ? `(${stop.stop.code})` : ""} -{" "}
              {stop.stop.distance}m
            </h3>
            <div className="flex flex-col gap-2">
              {departures.length === 0 && (
                <p className="text-(--text-subtle)">No upcoming departures</p>
              )}

              {departures.map((departure) => (
                <div
                  key={departure.lineCode + departure.expectedTime}
                  className="flex gap-4 bg-(--surface-muted) px-4 py-2 rounded-xl items-center"
                >
                  <span className="w-8 bg-(--fill-default) rounded flex items-center justify-center">
                    {departure.lineCode}
                  </span>
                  <span className="flex-1">{departure.name}</span>
                  <span>{getDepartureTime(departure.expectedTime)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
