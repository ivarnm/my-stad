"use server";

import { cookies } from "next/headers";
import { UserLocation } from ".";

export async function setUserLocation(location: UserLocation) {
  const cookieStore = await cookies();
  cookieStore.set("user-location", JSON.stringify(location), {
    maxAge: 315360000, // Ten years
  });
}

export async function getUserLocation(): Promise<UserLocation | null> {
  const cookieStore = await cookies();
  const locationCookie = cookieStore.get("user-location");
  if (locationCookie) {
    try {
      const location: UserLocation = JSON.parse(locationCookie.value);
      return location;
    } catch (error) {
      console.error("Error parsing user location from cookie:", error);
      return null;
    }
  }
  return null;
}
