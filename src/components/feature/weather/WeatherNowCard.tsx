import Card from "src/components/ui/Card";
import { getNowWeather } from "src/server/actions/weather";
import PrecipitationChart from "./PrecipitationChart";

export default async function WeatherNowCard() {
  const result = await getNowWeather();
  const data = result.data;
  const hasTimeseries = data?.timeseries && data.timeseries.length > 0;

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between mb-3">
        <div className="flex gap-2 items-center">
          <span className="material-symbols-outlined text-(--text-subtle)">
            cloud
          </span>
          <h2 className="text-xl font-bold">Weather Now</h2>
        </div>
        {result.data && (
          <span className={`text-3xl ${result.data.airTemperature >= 0 ? 'text-[#F54900]' : 'text-(--fill-default)'}`}>{result.data.airTemperature}°</span>
        )}
      </div>
      {result.error && (
        <p>{result.error}</p>
      )}
      {data && (
        <div>
          <p>{data.symbolCode ? data.symbolCode[0].toUpperCase() + data.symbolCode.slice(1) + ' -' : ''} Wind {Math.round(data.windSpeed)} ({Math.round(data.windGustSpeed)}) m/s</p>
        </div>
      )}
      {hasTimeseries && (
        <PrecipitationChart timeseries={data!.timeseries} />
      )}
    </Card>
  )
}
