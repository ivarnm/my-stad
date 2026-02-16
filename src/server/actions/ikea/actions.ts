"use server";

import httpClient from "../httpClient";
import { Result } from "src/server/actions/types";
import { IkeaDevice, IkeaLightGroup } from "./types";

async function ikeaClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.IKEA_HUB_URL;
  if (!baseUrl) {
    throw new Error("IKEA_HUB_URL is not defined as an environment variable");
  }

  const accessToken = process.env.IKEA_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "IKEA_ACCESS_TOKEN is not defined as an environment variable",
    );
  }

  return await httpClient<T>(baseUrl, endpoint, options, accessToken);
}

export async function getIkeaLightGroups(): Promise<Result<IkeaLightGroup[]>> {
  try {
    const devices = await ikeaClient<IkeaDevice[]>("v1/devices");

    const lightGroups: IkeaLightGroup[] = [];

    const lightDevices = devices.filter((device) => device.type === "light");

    const roomMap = new Map<string, IkeaDevice[]>();

    for (const device of lightDevices) {
      if (device.room) {
        const roomId = device.room.id;
        if (!roomMap.has(roomId)) {
          roomMap.set(roomId, []);
        }
        roomMap.get(roomId)!.push(device);
      }
    }

    for (const [, devices] of roomMap.entries()) {
      const room = devices[0].room!;
      lightGroups.push({
        id: room.id,
        name: room.name,
        icon: room.icon,
        devices: devices,
      });
    }

    return { data: lightGroups };
  } catch (error) {
    console.warn("Error fetching IKEA light groups:", error);
    return { error: "Klarte ikke hente lysgrupper fra IKEA Dirigera Hub" };
  }
}

export async function setIkeaGroupLightLevel(
  ikeaGroupId: string,
  lightLevel: number,
): Promise<Result<void>> {
  // call setDeviceLightLevel for each device in the group in parallel
  try {
    const groupResult = await getIkeaLightGroups();
    if (groupResult.error) {
      return { error: groupResult.error };
    }

    const ikeaGroup = groupResult.data!.find(
      (group) => group.id === ikeaGroupId,
    );
    if (!ikeaGroup) {
      return { error: "Klarte ikke å finne lysgruppen" };
    }

    await Promise.all(
      ikeaGroup.devices.map((device) =>
        setDeviceLightLevel(device, lightLevel),
      ),
    );
    return { data: undefined };
  } catch (error) {
    console.error("Error setting light level for IKEA group:", error);
    return { error: "Klarte ikke å endre lysnivå på lysgruppen" };
  }
}

export async function setDeviceLightLevel(
  device: IkeaDevice,
  lightLevel: number,
): Promise<Result<void>> {
  try {
    if (lightLevel === 0) {
      await patchDeviceAttributes(device.id, { isOn: false });
    } else {
      if (!device.attributes.isOn) {
        await patchDeviceAttributes(device.id, { isOn: true });
      }
      await patchDeviceAttributes(device.id, { lightLevel });
    }
    return { data: undefined };
  } catch (error) {
    console.error("Error setting device light level:", error);
    return { error: "Klarte ikke å endre lysnivå på enheten" };
  }
}

async function patchDeviceAttributes(
  deviceId: string,
  attributes: Partial<IkeaDevice["attributes"]>,
): Promise<void> {
  await ikeaClient<void>(`v1/devices/${deviceId}`, {
    method: "PATCH",
    body: JSON.stringify([{ attributes }]),
  });
}
