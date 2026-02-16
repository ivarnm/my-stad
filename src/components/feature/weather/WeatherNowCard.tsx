import Card from "src/components/ui/Card";
import { getNowWeather } from "src/server/actions/weather";
import PrecipitationChart from "./PrecipitationChart";
import Image from 'next/image';

export default async function WeatherNowCard() {
  const result = await getNowWeather();
  const data = result.data;
  const hasTimeseries = data?.timeseries && data.timeseries.length > 0;

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between">
        <div className='flex gap-2 items-center mb-1'>
          {data ? (
            <Image className=''
              src={`https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/png/${data.symbolCode}.png`}
              alt="Weather icon"
              width={20}
              height={20}
            />
          ) : (
            <span className="material-symbols-outlined text-(--text-subtle)">
              cloudy
            </span>
          )}
          <h2 className="text-lg font-bold">Weather Now</h2>
        </div>
        {data && (
          <div className="flex gap-2 items-end">
            <span className={`text-2xl ${data.airTemperature >= 0 ? 'text-[#F54900]' : 'text-(--fill-default)'}`}>{Math.round(data.airTemperature)}°</span>
            {data.perceivedTemperature !== undefined && (
              <span className={`text-sm ${data.perceivedTemperature >= 0 ? 'text-[#F54900]' : 'text-(--fill-default)'}`}><span className="text-(--text-subtle)">Feels </span>{Math.round(data.perceivedTemperature)}°</span>
            )}
          </div>
        )}
      </div>
      {result.error && (
        <p>{result.error}</p>
      )}
      {hasTimeseries && (
        <PrecipitationChart timeseries={data!.timeseries} />
      )}
    </Card>
  )
}
