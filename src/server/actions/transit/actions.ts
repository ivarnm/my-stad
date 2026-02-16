"use server";

import { TransitDeparture, TransitStop, TransitStopDepartures } from ".";
import httpClient from "../httpClient";
import { getUserLocation } from "../location";
import { Result } from "../types";
import { addCodesForDuplicateNames } from "./duplicateNameCodes";

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface NearestResponse {
  nearest: {
    edges: Array<{
      node: {
        place: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          quays: Array<{
            id: string;
            name: string;
            description: string;
            publicCode: string;
          }>;
        };
        distance: number;
      };
    }>;
  };
}

interface Quay {
  id: string;
  name: string;
  description: string;
  publicCode: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface TransitDeparturesResponse {
  quays: Array<{
    id: string;
    estimatedCalls: Array<{
      realtime: boolean;
      aimedDepartureTime: string; // ISO string
      expectedDepartureTime: string; // ISO string
      destinationDisplay: {
        frontText: string;
      };
      serviceJourney: {
        line: {
          publicCode: string;
          transportMode: string;
        };
        transportMode: string;
      };
    }>;
  }>;
}

async function enturClient<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const endpoint = "https://api.entur.io/journey-planner/v3/graphql";

  const response = await httpClient<T>(
    endpoint,
    "",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": "my-stad-app",
      },
      body: JSON.stringify({ query, variables }),
    },
    undefined,
    0,
  );
  return response;
}

export async function getClosestTransitStops(
  lat: number,
  long: number,
): Promise<Result<TransitStop[]>> {
  const query = `
    query getNearestTransitStops($latitude: Float!, $longitude: Float!) {
      nearest(
        latitude: $latitude
        longitude: $longitude
        maximumDistance: 1100
        maximumResults: 15
        filterByPlaceTypes: [stopPlace]
      ) {
        edges {
          node {
            place {
              ... on StopPlace {
                id
                name
                latitude
                longitude
                quays {
                  id
                  name
                  description
                  publicCode
                }
              }
            }
            distance
          }
        }
      }
    }
  `;
  const variables = { latitude: lat, longitude: long };

  try {
    const response = await enturClient<GraphqlResponse<NearestResponse>>(
      query,
      variables,
    );

    if (response.errors && response.errors.length > 0) {
      console.error("GraphQL errors:", response.errors);
      return { error: "Could not fetch transit stops" };
    }
    if (!response.data) {
      return { error: "No data received from transit API" };
    }

    const quays: Quay[] = [];
    response.data.nearest?.edges?.forEach((edge) => {
      const stopPlace = edge.node.place;
      const distance = edge.node.distance;

      // Add each quay as a separate entry
      stopPlace.quays?.forEach((quay) => {
        quays.push({
          id: quay.id,
          name: stopPlace.name,
          description: quay.description,
          publicCode: quay.publicCode,
          latitude: stopPlace.latitude,
          longitude: stopPlace.longitude,
          distance: distance,
        });
      });
    });

    const transitStops: TransitStop[] = quays.map((quay) => ({
      id: quay.id,
      name: `${quay.name} ${quay.publicCode ? `${quay.publicCode}` : ""}`,
      distance: Math.round(quay.distance),
    }));
    const transitStopsWithCodes = addCodesForDuplicateNames(transitStops);

    return { data: transitStopsWithCodes };
  } catch (error) {
    console.error("Error fetching transit stops:", error);
    return { error: "Could not fetch transit stops" };
  }
}

export async function getTransitStopDepartures(): Promise<
  Result<TransitStopDepartures[]>
> {
  const userSettings = await getUserLocation();
  if (
    !userSettings ||
    !userSettings.transitStops ||
    userSettings.transitStops.length === 0
  ) {
    return { error: "No transit stops configured" };
  }

  try {
    const query = `
      query getDepartures($ids: [String!]) {
        quays(ids: $ids) {
          id
          estimatedCalls(numberOfDepartures: 4, timeRange: 86400) {
            realtime
            aimedDepartureTime
            expectedDepartureTime
            destinationDisplay {
              frontText
            }
            serviceJourney {
              line {
                publicCode
                transportMode
              }
              transportMode
            }
          }
        }
      }
    `;
    const variables = { ids: userSettings.transitStops.map((stop) => stop.id) };

    const response = await enturClient<
      GraphqlResponse<TransitDeparturesResponse>
    >(query, variables);
    if (response.errors && response.errors.length > 0) {
      console.error("GraphQL errors:", response.errors);
      return { error: "Could not fetch transit departures" };
    }
    if (!response.data) {
      return { error: "No data received from transit API" };
    }

    const stopDepartures: TransitStopDepartures[] = response.data.quays.map(
      (quay) => {
        const stopInfo = userSettings.transitStops!.find(
          (stop) => stop.id === quay.id,
        );
        const departures = quay.estimatedCalls.map((call) => ({
          name: call.destinationDisplay.frontText,
          lineCode: call.serviceJourney.line.publicCode,
          transportMode: call.serviceJourney
            .transportMode as TransitDeparture["transportMode"],
          realTime: call.realtime,
          scheduledTime: new Date(call.aimedDepartureTime),
          expectedTime: new Date(call.expectedDepartureTime),
        }));
        return {
          stop: stopInfo!,
          departures,
        };
      },
    );

    return { data: stopDepartures };
  } catch (error) {
    console.error("Error fetching transit departures:", error);
    return { error: "Could not fetch transit departures" };
  }
}
