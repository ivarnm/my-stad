temperature = 37
wind_ms = 3.4
humidity = 80

def calculate_wind_chill(temperature, wind_ms):
  # https://en.wikipedia.org/wiki/Wind_chill#North_American_and_United_Kingdom_wind_chill_index
  if temperature > 10 or wind_ms <= 1.33:
    return temperature  # Wind chill is not applicable
  
  V = wind_ms * 3.6  # Convert m/s to km/h
  T = temperature
  wci = 13.12 + 0.6215 * T - 11.37 * (V ** 0.16) + 0.3965 * T * (V ** 0.16)
  return wci

def calculate_heat_index(temperature, humidity):
  # https://en.wikipedia.org/wiki/Heat_index#Formula
  if temperature < 27 or humidity < 40:
    return temperature  # Heat index is not applicable
  if temperature > 33:
    return temperature  # Heat index starts to be inaccurate above 33°C
  
  T = temperature
  R = humidity
  c1 = -8.78469475556
  c2 = 1.61139411
  c3 = 2.33854883889
  c4 = -0.14611605
  c5 = -0.012308094
  c6 = -0.016424828
  c7 = 2.211732e-3
  c8 = 7.2546e-4
  c9 = -3.582e-6

  HI = c1 + c2 * T + c3 * R + c4 * T * R + c5 * (T ** 2) + c6 * (R ** 2) + c7 * (T ** 2) * R + c8 * T * (R ** 2) + c9 * (T ** 2) * (R ** 2)
  return HI

wci = calculate_wind_chill(temperature, wind_ms)
hi = calculate_heat_index(temperature, humidity)
perceived_temperature = wci if wci < temperature else hi

print(f"Perceived temperature: {perceived_temperature:.2f}°C")