import TimeCard from "src/components/feature/time/TimeCard"
import Card from "src/components/ui/Card"

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <TimeCard />
      <Card>
        <h2 className="text-xl font-bold mb-2">Column 2</h2>
      </Card>
      <Card>
        <h2 className="text-xl font-bold mb-2">Column 3</h2>
      </Card>
    </div>
  )
}
