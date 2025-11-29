import { getUserLocation } from "../location";
import type { TrashSchedule } from ".";
import { Result } from "../types";
import httpClient from "../httpClient";

interface TrashLocation {
  id: string;
  adresse: string;
}

interface TrashCalendar {
  id: string;
  name: string;
  calendar: Calendar[];
}

interface Calendar {
  dato: string; // ISO date string
  fraksjon: string;
  fraksjonId: string;
}

const trashMapping: Record<string, { color: string; name: string }> = {
  "2400": { color: "#3880B9", name: "Paper" },
  "3000": { color: "#479e55", name: "Food waste" },
  "3200": { color: "#8a2a7e", name: "Plastics" },
  "9999": { color: "#f5f5f5", name: "General waste" },
};

async function trvClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = "https://trv.no/wp-json/wasteplan/v2/";

  return await httpClient<T>(baseUrl, endpoint, options);
}

export async function getTrashSchedule(): Promise<Result<TrashSchedule[]>> {
  const location = await getUserLocation();
  if (!location?.address) {
    return { error: "No location set" };
  }

  try {
    const encodedAddress = encodeURIComponent(location.address);
    const trashLocation = await trvClient<TrashLocation[]>(
      `adress?s=${encodedAddress}`
    );

    if (trashLocation.length === 0) {
      return { error: "No trash location found for the given address" };
    }
    const trashCalendar = await trvClient<TrashCalendar>(
      `calendar/${trashLocation[0].id}`
    );

    const now = new Date();
    const scheduleMap: Record<string, TrashSchedule> = {};

    for (const entry of trashCalendar.calendar) {
      if (!scheduleMap[entry.fraksjonId] && trashMapping[entry.fraksjonId]) {
        console.log("Adding..");
        console.log(entry);
        const pickupDate = new Date(entry.dato);
        const timeDiff = pickupDate.getTime() - now.getTime();
        const daysUntilNextPickup = Math.ceil(timeDiff / (1000 * 3600 * 24));

        scheduleMap[entry.fraksjonId] = {
          name: trashMapping[entry.fraksjonId].name,
          color: trashMapping[entry.fraksjonId].color,
          daysUntilNextPickup,
        };
      }
    }

    const schedule = Object.values(scheduleMap).sort(
      (a, b) => a.daysUntilNextPickup - b.daysUntilNextPickup
    );

    return { data: schedule };
  } catch (error) {
    console.error("Error fetching trash schedule:", error);
    return { error: "Could not fetch trash schedule" };
  }
}
