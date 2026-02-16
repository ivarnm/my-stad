"use client";

import { useState } from "react";
import { IkeaLightGroup, setIkeaGroupLightLevel } from "src/server/actions/ikea";
import styles from "./LightSlider.module.css";

export default function LightSlider({ ikeaLightGroup }: { ikeaLightGroup: IkeaLightGroup }) {
  const [lightLevel, setLightLevel] = useState<number>(() => {
    const avgLevel =
      ikeaLightGroup.devices.reduce(
        (sum, device) => sum + (device.attributes.lightLevel || 0),
        0
      ) / ikeaLightGroup.devices.length;
    const allOff = ikeaLightGroup.devices.every(
      (device) => device.attributes.isOn === false
    );
    return allOff ? 0 : Math.round(avgLevel);
  });

  const handleSliderChange = (value: number) => {
    setLightLevel(value);
  };

  const handleSliderRelease = async () => {
    const result = await setIkeaGroupLightLevel(ikeaLightGroup.id, lightLevel);
    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h3 className=" font-medium">{ikeaLightGroup.name}</h3>
        <span className="text-neutral-400">{lightLevel > 0 ? `${lightLevel}%` : "Off"}</span>
      </div>
      <div className="relative w-full">
        <input
          type="range"
          min="0"
          max="100"
          value={lightLevel}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, var(--fill-default) 0%, var(--fill-default) ${lightLevel}%, rgb(64 64 64) ${lightLevel}%, rgb(64 64 64) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
