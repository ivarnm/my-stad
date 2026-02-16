import Card from 'src/components/ui/Card'
import { getWeatherForecasat } from 'src/server/actions/weather'
import SunTimes from './SunTimes';
import Image from 'next/image';
import WeatherAlerts from './WeatherAlerts';

export default async function WeatherForecastCard() {
  const result = await getWeatherForecasat();
  const forecast = result.data;
  const hasPercipitation = forecast?.weather.some(hour => hour.maxPrecipitationAmount > 0);

  return (
    <Card className="flex flex-col">
      <div className='flex gap-2 items-center justify-between mb-1'>
        <h2 className="text-lg font-bold">Weather Today</h2>
        {!result.error && forecast && (
          <WeatherAlerts alerts={forecast.alerts} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        {result.error && (
          <p>{result.error}</p>
        )}
        {!result.error && forecast && (
          <>
            <SunTimes sunrise={forecast.sunrise} sunset={forecast.sunset} />

            {forecast.weather.map(hour => (
              <div key={hour.time.toISOString()} className='flex gap-4 text-sm items-center justify-between bg-(--surface-muted) px-4 py-1 rounded-lg'>
                <p>{String(hour.time.getHours()).padStart(2, "0")}</p>
                {hour.symbolCode ? (
                  <div className='w-[25px]'>
                    <Image className=''
                      src={`https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/png/${hour.symbolCode}.png`}
                      alt="Weather icon"
                      width={25}
                      height={25}
                    />
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
                <p className={`min-w-7 text-right ${hour.airTemperature >= 0 ? 'text-[#F54900]' : 'text-(--fill-default)'}`}>{hour.airTemperature.toFixed(0)}°</p>
                {hasPercipitation && (
                  <p className='min-w-14 text-(--fill-default)'>{hour.maxPrecipitationAmount > 0 ? `${hour.minPrecipitationAmount} - ${hour.maxPrecipitationAmount}` : ''}</p>
                )}
                <div className='flex justify-end items-center gap-2'>
                  <span>{`${hour.windSpeed.toFixed(0)} ${hour.windGustSpeed ? `(${hour.windGustSpeed.toFixed(0)})` : ''}`}</span>
                  <span className='' style={{ transform: `rotate(${hour.windFromDirection}deg)` }}>
                    <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path fill="currentColor" fillRule="evenodd" d="M11.53 3l-.941 12.857L7 15l5.001 6L17 15l-3.587.857L12.471 3h-.941z" clipRule="evenodd"></path>
                    </svg>
                  </span>
                </div>
              </div>
            ))}

            {/* <table className="w-full border-separate" style={{ borderSpacing: "0 0.5rem" }}>
              <tbody>
                {forecast.weather.map((hour) => (
                  <tr key={hour.time.toISOString()} className="text-sm">
                    <td className="bg-(--surface-muted) px-2 py-1 rounded-l-xl">{String(hour.time.getHours()).padStart(2, "0")}</td>
                    <td className="bg-(--surface-muted) px-2">
                      {hour.symbolCode ? (
                        <div className='w-[25px]'>
                          <Image className=''
                            src={`https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/png/${hour.symbolCode}.png`}
                            alt="Weather icon"
                            width={25}
                            height={25}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className={`bg-(--surface-muted) px-2 py-1 ${hour.airTemperature >= 0 ? 'text-[#F54900]' : 'text-(--fill-default)'}`}>{hour.airTemperature.toFixed(0)}°</td>
                    <td className="bg-(--surface-muted) px-2 py-1 text-(--fill-default)">
                      {hour.maxPrecipitationAmount >= 0 ? `${hour.minPrecipitationAmount} - ${hour.maxPrecipitationAmount}` : ''}
                    </td>
                    <td className="bg-(--surface-muted) px-2 py-1 rounded-r-xl flex justify-end items-center gap-2">
                      <span>{`${hour.windSpeed.toFixed(0)} ${hour.windGustSpeed ? `(${hour.windGustSpeed.toFixed(0)})` : ''}`}</span>
                      <span className='' style={{ transform: `rotate(${hour.windFromDirection}deg)` }}>
                        <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                          <path fill="currentColor" fillRule="evenodd" d="M11.53 3l-.941 12.857L7 15l5.001 6L17 15l-3.587.857L12.471 3h-.941z" clipRule="evenodd"></path>
                        </svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
          </>
        )}
      </div>
    </Card>
  )
}
