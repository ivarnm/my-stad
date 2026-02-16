"use client";

import { useState } from "react";
import { IkeaLightGroup } from "src/server/actions/ikea";
import { setIkeaGroupLightLevel } from "src/server/actions/ikea";

interface IkeaLightControlProps {
  lightGroups: IkeaLightGroup[];
}

export default function IkeaLightControl({
  lightGroups,
}: IkeaLightControlProps) {
  const [lightLevels, setLightLevels] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      lightGroups.forEach((group) => {
        // Calculate average light level from devices
        const avgLevel =
          group.devices.reduce(
            (sum, device) => sum + (device.attributes.lightLevel || 0),
            0
          ) / group.devices.length;
        const allOff = group.devices.every(
          (device) => device.attributes.isOn === false
        );
        initial[group.id] = allOff ? 0 : Math.round(avgLevel);
      });
      return initial;
    }
  );

  const handleSliderChange = (groupId: string, value: number) => {
    setLightLevels((prev) => ({
      ...prev,
      [groupId]: value,
    }));
  };

  const handleSliderRelease = async (group: IkeaLightGroup) => {
    const level = lightLevels[group.id];

    const result = await setIkeaGroupLightLevel(group.id, level);
    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold mb-4">Light Control</h2>
      {lightGroups.map((group) => (
        <div
          key={group.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{group.icon}</span>
              <h3 className="text-lg font-semibold">{group.name}</h3>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {lightLevels[group.id]}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={lightLevels[group.id] || 0}
              onChange={(e) =>
                handleSliderChange(group.id, parseInt(e.target.value))
              }
              onMouseUp={() => handleSliderRelease(group)}
              onTouchEnd={() => handleSliderRelease(group)}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm text-gray-500">100%</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {group.devices.length} device{group.devices.length !== 1 ? "s" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
