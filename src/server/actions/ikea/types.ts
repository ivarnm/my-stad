export interface IkeaDevice {
  id: string;
  type: string;
  isReachable: boolean;
  isHidden: boolean;
  attributes: {
    customName?: string;
    isOn?: boolean;
    lightLevel?: number;
    colorTemperature?: number;
    colorTemperatureMin?: number;
    colorTemperatureMax?: number;
  };
  capabilities: {
    canReceive: string[];
  };
  room?: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface IkeaLightGroup {
  id: string;
  name: string;
  icon: string;
  devices: IkeaDevice[];
}
