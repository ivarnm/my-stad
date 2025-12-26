import httpClient from "../httpClient";
import { getUserLocation, UserLocation } from "../location";
import { Result } from "../types";
import {
  ContentBlock,
  HourlyWeather,
  WeatherAlert,
  WeatherAlertOld,
  WeatherForecast,
} from ".";
import { mergeInfoBlocks } from "./alertInfoParse";

interface MetHourlyWeatherResponse {
  properties: {
    timeseries: {
      time: string;
      data: {
        instant: {
          details: {
            air_temperature: number;
            wind_from_direction: number;
            wind_speed: number;
            wind_speed_of_gust?: number;
          };
        };
        next_1_hours?: {
          details: {
            precipitation_amount_min: number;
            precipitation_amount_max: number;
          };
          summary: {
            symbol_code: string;
          };
        };
      };
    }[];
  };
}

interface MetSunsetResponse {
  properties: {
    sunrise: {
      time: string;
    };
    sunset: {
      time: string;
    };
  };
}

interface MetAlertsResponse {
  features: {
    properties: {
      area: string;
      awareness_level: string;
      consequences: string;
      description: string;
      event: string;
      eventAwarenessName: string;
      instruction: string;
      resources: {
        description: string;
        mimeType: string;
        uri: string;
      }[];
    };
    when: {
      interval: string[]; // [from, to] in ISO format
    };
  }[];
}

interface YrAlertsResponse {
  warnings: {
    meta: {
      id: string;
      shortTitle: string;
      severity: "Minor" | "Moderate" | "Severe" | "Extreme" | "Ultra";
      eventType: string;
      eventStatus: "Ongoing" | "Expected";
      areas: string[];
    };
    content: ContentBlock[];
  }[];
}

async function metClient<T>(
  endpoint: string,
  options: RequestInit = {},
  revalidate: number = 3600
): Promise<T> {
  const baseUrl = "https://api.met.no/weatherapi/";
  options.headers = {
    ...options.headers,
    "User-Agent": "my-stad/1.0",
  };

  return await httpClient<T>(baseUrl, endpoint, options, undefined, revalidate);
}

async function yrClient<T>(
  endpoint: string,
  options: RequestInit = {},
  revalidate: number = 3600
): Promise<T> {
  const baseUrl = "https://www.yr.no/api/v0/";
  options.headers = {
    ...options.headers,
    "User-Agent": "my-stad/1.0",
  };

  return await httpClient<T>(baseUrl, endpoint, options, undefined, revalidate);
}

export async function getWeatherForecasat(): Promise<Result<WeatherForecast>> {
  const location = await getUserLocation();
  if (!location) {
    return { error: "No location set" };
  }

  try {
    const [weather, { sunrise, sunset }, alertsOld, alerts] = await Promise.all(
      [
        getHourlyWeather(location),
        getSunriseAndSunset(location),
        getWeatherAlertsOld(location),
        getWeatherAlerts(),
      ]
    );

    return {
      data: {
        weather,
        sunrise,
        sunset,
        alertsOld,
        alerts,
      },
    };
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return { error: "Failed to fetch weather forecast" };
  }
}

async function getHourlyWeather(
  location: UserLocation
): Promise<HourlyWeather[]> {
  const data = await metClient<MetHourlyWeatherResponse>(
    `locationforecast/2.0/complete?lat=${location.lat}&lon=${location.long}`,
    {},
    0
  );
  const timeseries = data.properties.timeseries.slice(0, 24); // Get next 24 hours

  return timeseries.map((entry) => {
    const details = entry.data.instant.details;
    const next1Hours = entry.data.next_1_hours;

    return {
      time: new Date(entry.time),
      airTemperature: details.air_temperature,
      windFromDirection: details.wind_from_direction,
      windSpeed: details.wind_speed,
      windGustSpeed: details.wind_speed_of_gust,
      minPrecipitationAmount: next1Hours?.details?.precipitation_amount_min
        ? next1Hours.details.precipitation_amount_min
        : 0,
      maxPrecipitationAmount: next1Hours?.details?.precipitation_amount_max
        ? next1Hours.details.precipitation_amount_max
        : 0,
      symbolCode: next1Hours?.summary?.symbol_code,
    };
  });
}

async function getSunriseAndSunset(
  location: UserLocation
): Promise<{ sunrise: Date; sunset: Date }> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const data = await metClient<MetSunsetResponse>(
    `sunrise/3.0/sun?lat=${location.lat}&lon=${location.long}&date=${dateStr}`,
    {},
    86400
  );

  return {
    sunrise: new Date(data.properties.sunrise.time),
    sunset: new Date(data.properties.sunset.time),
  };
}

async function getWeatherAlertsOld(
  location: UserLocation
): Promise<WeatherAlertOld[]> {
  const data = await metClient<MetAlertsResponse>(
    `metalerts/2.0/current.json?lat=${location.lat}&lon=${location.long}&lang=en`,
    {},
    0
  );

  return data.features.map((feature) => {
    const props = feature.properties;
    const when = feature.when.interval;
    const [awarenessLevel, awarenessCode] = props.awareness_level.split(";");

    return {
      symbolCode: `icon-warning-${props.eventAwarenessName.toLowerCase()}-${awarenessCode.trim()}.png`,
      area: props.area,
      awarenessLevel: parseInt(awarenessLevel),
      eventName: props.eventAwarenessName,
      infoBlocks: mergeInfoBlocks(
        props.eventAwarenessName,
        props.description,
        props.consequences,
        props.instruction
      ),
      map: props.resources.find((r) => r.mimeType === "image/png")?.uri,
      mapAltText: props.resources.find((r) => r.mimeType === "image/png")
        ?.description,
      fromDate: when[0] ? new Date(when[0]) : undefined,
      toDate: when[1] ? new Date(when[1]) : undefined,
    };
  });
}

async function getWeatherAlerts(): Promise<WeatherForecast["alerts"]> {
  const location = "1-211102"; // Trondheim
  // const location = "1-305409"; // Tromsø
  // const location = "1-164194"; // Vinstra
  const data = await yrClient<YrAlertsResponse>(
    `locations/${location}/warnings?language=en`,
    {},
    0
  );

  return data.warnings
    .map((warning) => ({
      id: warning.meta.id,
      title: warning.meta.shortTitle,
      severity: warning.meta.severity,
      eventStatus: warning.meta.eventStatus,
      warningIcon: `icon-warning-${warning.meta.eventType.toLowerCase()}-${getSeverityColor(
        warning.meta.severity
      )}.png`,
      area: warning.meta.areas.find(Boolean),
      content: warning.content,
    }))
    .sort((a, b) => {
      const severityOrder = ["Ultra", "Extreme", "Severe", "Moderate", "Minor"];
      return (
        severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
      );
    })
    .reduce(
      (acc, alert) => {
        if (alert.eventStatus === "Ongoing") {
          acc.ongoing.push(alert);
        } else {
          acc.expected.push(alert);
        }
        return acc;
      },
      { ongoing: [] as WeatherAlert[], expected: [] as WeatherAlert[] }
    );
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "extreme":
      return "red";
    case "severe":
      return "orange";
    case "minor":
    case "moderate":
    default:
      return "yellow";
  }
}
