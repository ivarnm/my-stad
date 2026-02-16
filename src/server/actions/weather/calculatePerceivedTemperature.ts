export function calculatePerceivedTemperature(
  temperature: number,
  windSpeed: number, // m/s
  humidity: number, // %
): number {
  const wci = calculateWindChill(temperature, windSpeed);
  const hi = calculateHeatIndex(temperature, humidity);

  if (wci !== null) {
    return wci;
  }
  if (hi !== null) {
    return hi;
  }
  return temperature;
}

function calculateWindChill(
  temperature: number,
  windSpeed: number,
): number | null {
  // https://en.wikipedia.org/wiki/Wind_chill#North_American_and_United_Kingdom_wind_chill_index
  if (temperature > 10 || windSpeed <= 1.33) {
    return null; // Wind chill is not applicable
  }

  const V = windSpeed * 3.6; // Convert m/s to km/h
  const T = temperature;

  const wci = 13.12 + 0.6215 * T - 11.37 * V ** 0.16 + 0.3965 * T * V ** 0.16;
  return wci;
}

function calculateHeatIndex(
  temperature: number,
  humidity: number,
): number | null {
  // https://en.wikipedia.org/wiki/Heat_index#Formula
  if (temperature < 27 || humidity < 40) {
    return null; // Heat index is not applicable
  }
  if (temperature > 33) {
    return null; // Heat index starts to be inaccurate above 33°C
  }

  const T = temperature;
  const R = humidity;

  const c1 = -8.78469475556;
  const c2 = 1.61139411;
  const c3 = 2.33854883889;
  const c4 = -0.14611605;
  const c5 = -0.012308094;
  const c6 = -0.016424828;
  const c7 = 2.211732e-3;
  const c8 = 7.2546e-4;
  const c9 = -3.582e-6;

  const HI =
    c1 +
    c2 * T +
    c3 * R +
    c4 * T * R +
    c5 * T ** 2 +
    c6 * R ** 2 +
    c7 * T ** 2 * R +
    c8 * T * R ** 2 +
    c9 * T ** 2 * R ** 2;

  return HI;
}
