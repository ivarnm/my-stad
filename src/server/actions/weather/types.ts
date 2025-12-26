export interface HourlyWeather {
  time: Date;
  airTemperature: number; // in Celsius
  windFromDirection: number; // in degrees
  windSpeed: number; // in m/s
  windGustSpeed?: number; // in m/s
  minPrecipitationAmount: number; // in mm
  maxPrecipitationAmount: number; // in mm
  symbolCode?: string; // weather symbol code referencing https://github.com/metno/weathericons/tree/main/weather
}

export interface WeatherAlertOld {
  symbolCode: string; // alert symbol referencing https://github.com/nrkno/yr-warning-icons/tree/master
  area: string;
  awarenessLevel: number;
  eventName: string;
  infoBlocks: {
    title: string;
    description: string;
  }[]; // comprised of eventName, description, consequences and instruction from the met.no api
  map?: string; // image url
  mapAltText?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface WeatherForecast {
  weather: HourlyWeather[];
  sunrise: Date;
  sunset: Date;
  alertsOld?: WeatherAlertOld[];
  alerts: {
    ongoing: WeatherAlert[];
    expected: WeatherAlert[];
  };
}

export interface WeatherAlert {
  id: string;
  title: string;
  severity: "Minor" | "Moderate" | "Severe" | "Extreme" | "Ultra";
  eventStatus: "Ongoing" | "Expected";
  warningIcon: string;
  area?: string;
  content: ContentBlock[];
}

interface BaseContent {
  type: ContentType;
}

export type ContentType =
  | "heading-2"
  | "text"
  | "list"
  | "timeline"
  | "link"
  | "severity"
  | "image";

export interface HeadingContent extends BaseContent {
  type: "heading-2";
  text: string;
}

export interface TextContent extends BaseContent {
  type: "text";
  text: string;
}

export interface LinkContent extends BaseContent {
  type: "link";
  text: string;
  itemType: "link";
  url: string;
  linkText: string;
}

export interface ListItem {
  type: "text";
  itemType: "text";
  text: string;
}

export interface ListContent extends BaseContent {
  type: "list";
  items: ListItem[];
}

export interface TimelineContent extends BaseContent {
  type: "timeline";
  items: ListItem[];
}

export interface ImageContent extends BaseContent {
  type: "image";
  description: string;
  url: string;
}

export interface DangerLevel {
  severity: "Minor" | "Moderate" | "Severe" | "Extreme" | "Ultra";
  description: string;
  selected: boolean;
  disabled: boolean;
}

export interface SeverityContent extends BaseContent {
  type: "severity";
  dangerLevels: DangerLevel[];
  helpText: LinkContent;
}

export type ContentBlock =
  | HeadingContent
  | TextContent
  | LinkContent
  | ListContent
  | TimelineContent
  | SeverityContent
  | ImageContent;
