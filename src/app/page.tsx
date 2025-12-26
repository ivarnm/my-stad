import ElectricityCard from "src/components/feature/electricity/ElectricityCard"
import LightControlsCard from "src/components/feature/lights/LightControlsCard"
import TimeCard from "src/components/feature/time/TimeCard"
import TrashCard from "src/components/feature/trash/TrashCard"
import WeatherForecastCard from "src/components/feature/weather/WeatherForecastCard"
import Card from "src/components/ui/Card"

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
      <div className="flex flex-col gap-4 overflow-y-auto">
        <TimeCard />
        <LightControlsCard />
        <TrashCard />
        <ElectricityCard />
      </div>
      <div className="flex flex-col gap-4 min-h-0">
        <WeatherForecastCard />
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto">
        <Card>
          <h2 className="text-xl font-bold mb-2">Column 3</h2>
        </Card>
      </div>
    </div>
  )
}
