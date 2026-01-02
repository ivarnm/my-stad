import Card from 'src/components/ui/Card'
import { getWeatherForecasat } from 'src/server/actions/weather'
import SunTimes from './SunTimes';
import Image from 'next/image';
import WeatherAlerts from './WeatherAlerts';

export default async function WeatherForecastCard() {
  const result = await getWeatherForecasat();
  const forecast = result.data;

  return (
    <Card className="flex flex-col">
      <div className='flex gap-2 items-center justify-between mb-3'>
        <h2 className="text-xl font-bold">Weather Today</h2>
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

            <table className="w-full border-separate" style={{ borderSpacing: "0 0.75rem" }}>
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 pb-2 font-normal">Time</th>
                  <th className="px-4 pb-2 font-normal" aria-label='Weather icon'></th>
                  <th className="px-4 pb-2 font-normal">Temp.</th>
                  <th className="px-4 pb-2 font-normal">Rain</th>
                  <th className="px-4 pb-2 font-normal">Wind</th>
                </tr>
              </thead>
              <tbody>
                {forecast.weather.map((hour) => (
                  <tr key={hour.time.toISOString()} className="text-lg">
                    <td className="bg-(--surface-muted) px-5 py-1 rounded-l-xl">{String(hour.time.getHours()).padStart(2, "0")}</td>
                    <td className="bg-(--surface-muted) px-5">
                      {hour.symbolCode ? (
                        <div className='w-[30px]'>
                          <Image className=''
                            src={`https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/png/${hour.symbolCode}.png`}
                            alt="Weather icon"
                            width={30}
                            height={30}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className={`bg-(--surface-muted) px-5 py-1 ${hour.airTemperature > 0 ? 'text-[#F54900]' : 'text-(--fill-default)'}`}>{hour.airTemperature.toFixed(0)}°</td>
                    <td className="bg-(--surface-muted) px-5 py-1 text-(--fill-default)">
                      {hour.maxPrecipitationAmount > 0 ? `${hour.minPrecipitationAmount} - ${hour.maxPrecipitationAmount}` : ''}
                    </td>
                    <td className="bg-(--surface-muted) px-5 py-1 rounded-r-xl flex justify-end items-center gap-2">
                      <span>{`${hour.windSpeed.toFixed(0)} ${hour.windGustSpeed ? `(${hour.windGustSpeed.toFixed(0)})` : ''}`}</span>
                      {/* <span className='material-symbols-outlined'>{hour.windIcon}</span> */}
                      <span className='' style={{ transform: `rotate(${hour.windFromDirection}deg)` }}>
                        <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                          <path fill="currentColor" fillRule="evenodd" d="M11.53 3l-.941 12.857L7 15l5.001 6L17 15l-3.587.857L12.471 3h-.941z" clipRule="evenodd"></path>
                        </svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Card>
  )
}
