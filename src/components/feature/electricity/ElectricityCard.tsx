import Card from "src/components/ui/Card";
import { getElectricityPrices } from "src/server/actions/electricity"
import ResponsiveElectricityChart from "./ElectricityChart";
import CurrentPrice from "./CurrentPrice";
import CardHeader from "src/components/ui/CardHeader";

export default async function ElectricityCard() {
  const result = await getElectricityPrices();

  return (
    <Card className="flex flex-col relative">
      <CardHeader icon="electric_bolt" title="Electricity Prices" />
      <CurrentPrice data={result.data} />
      {result.data ? (
        <ResponsiveElectricityChart data={result.data} />
      ) : (
        <p>No electricity data available.</p>
      )}
    </Card>
  )
}
