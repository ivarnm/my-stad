import Card from "src/components/ui/Card";
import { getElectricityPrices } from "src/server/actions/electricity"
import ResponsiveElectricityChart from "./ElectricityChart";
import CurrentPrice from "./CurrentPrice";

export default async function ElectricityCard() {
  const result = await getElectricityPrices();

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between mb-3">
        <div className="flex gap-2 items-center">
          <span className="material-symbols-outlined text-(--text-subtle)">
            electric_bolt
          </span>
          <h2 className="text-xl font-bold">Electricity Prices</h2>
        </div>
        <CurrentPrice data={result.data} />
      </div>
      {result.data ? (
        <ResponsiveElectricityChart data={result.data} />
      ) : (
        <p>No electricity data available.</p>
      )}
    </Card>
  )
}
