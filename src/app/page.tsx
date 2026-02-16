import ElectricityCard from "src/components/feature/electricity/ElectricityCard"
import LightControlsCard from "src/components/feature/lights/LightControlsCard"
import TimeCard from "src/components/feature/time/TimeCard"
import TransitDeparturesCard from "src/components/feature/transit/TransitDeparturesCard"
import TrashCard from "src/components/feature/trash/TrashCard"
import WeatherForecastCard from "src/components/feature/weather/WeatherForecastCard"
import WeatherNowCard from "src/components/feature/weather/WeatherNowCard"

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-[calc(100vh-2rem)]">
      <div className="flex flex-col gap-3">
        <TimeCard />
        <LightControlsCard />
        <TrashCard />
        <ElectricityCard />
      </div>
      <div className="flex flex-col gap-3">
        <WeatherNowCard />
        <WeatherForecastCard />
      </div>
      <div className="flex flex-col gap-3">
        <TransitDeparturesCard />
      </div>
    </div>
  )
}
