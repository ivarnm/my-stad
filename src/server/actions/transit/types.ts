export interface TransitStop {
  id: string;
  name: string;
  distance: number;
  code?: number; // optional field to distinguish stops with same name
}

export interface TransitDeparture {
  name: string;
  lineCode: string;
  transportMode:
    | "air"
    | "bus"
    | "cableway"
    | "water"
    | "funicular"
    | "lift"
    | "rail"
    | "metro"
    | "taxi"
    | "tram"
    | "trolleybus"
    | "monorail"
    | "coach"
    | "unknown";
  realTime: boolean;
  scheduledTime: Date;
  expectedTime: Date;
}

export interface TransitStopDepartures {
  stop: TransitStop;
  departures: TransitDeparture[];
}
