import { HourlyElectricityPrice, ElectricityPrices } from ".";
import httpClient from "../httpClient";
import { Result } from "../types";

interface ElectricityApiResponse {
  NOK_per_kWh: number;
  time_start: string; // ISO 8601 format
}

async function electricityClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = "https://www.hvakosterstrommen.no/api/v1/";

  return await httpClient<T>(baseUrl, endpoint, options);
}

async function fetchPricesForDate(
  date: Date
): Promise<HourlyElectricityPrice[]> {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const apiResponse = await electricityClient<ElectricityApiResponse[]>(
    `prices/${yyyy}/${mm}-${dd}_NO3.json`
  );

  return apiResponse.map((price) => {
    const pricePerKWh = parseFloat((price.NOK_per_kWh * 1.25).toFixed(2)); // include 25% VAT

    return {
      time: new Date(price.time_start),
      pricePerKWh,
      priceWithSubsidy:
        price.NOK_per_kWh > 0.75
          ? parseFloat(
              (pricePerKWh - (price.NOK_per_kWh - 0.75) * 0.9 * 1.25).toFixed(2)
            )
          : pricePerKWh,
    };
  });
}

export async function getElectricityPrices(): Promise<
  Result<ElectricityPrices>
> {
  try {
    const today = new Date();
    const prices: ElectricityPrices = {
      today: await fetchPricesForDate(today),
      tomorrow: undefined,
    };

    if (today.getHours() >= 16) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      prices.tomorrow = await fetchPricesForDate(tomorrow);
    }

    return { data: prices };
  } catch (error) {
    console.error("Error fetching electricity prices:", error);
    return { error: "Could not fetch electricity prices" };
  }
}
