"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { UserLocation } from ".";
import { TransitStop } from "../transit";

export async function setUserLocation(location: UserLocation) {
  const cookieStore = await cookies();
  cookieStore.set("user-location", JSON.stringify(location), {
    maxAge: 315360000, // Ten years
  });
}

export async function saveUserLocation(
  prevState: {
    success?: boolean;
    message?: string;
  },
  formData: FormData
) {
  const address = formData.get("address") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const long = parseFloat(formData.get("long") as string);
  const transitStopsJson = formData.getAll("transitStops") as string[];
  const transitStops = transitStopsJson.map(
    (stop) => JSON.parse(stop) as TransitStop
  );

  const location: UserLocation = {
    address,
    lat,
    long,
    transitStops,
  };

  await setUserLocation(location);
  revalidatePath("/");

  return { message: "Settings saved successfully!" };
}

export async function getUserLocation(): Promise<UserLocation | null> {
  const cookieStore = await cookies();
  const locationCookie = cookieStore.get("user-location");
  if (locationCookie) {
    try {
      const location: UserLocation = JSON.parse(
        locationCookie.value
      ) as UserLocation;

      return location;
    } catch (error) {
      console.error("Error parsing user location from cookie:", error);
      return null;
    }
  }
  return null;
}
