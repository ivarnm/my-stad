import { TransitStop } from "../transit";

export interface UserLocation {
  address: string;
  lat: number;
  long: number;
  transitStops?: TransitStop[];
}
