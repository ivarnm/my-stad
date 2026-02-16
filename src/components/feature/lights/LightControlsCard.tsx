import Card from 'src/components/ui/Card'
import { getIkeaLightGroups } from 'src/server/actions/ikea';
import LightSlider from './LightSlider';
import CardHeader from 'src/components/ui/CardHeader';

export default async function LightControlsCard() {
  const result = await getIkeaLightGroups();

  return (
    <Card>
      <CardHeader icon="lightbulb" title="Lights" />
      <div className='flex flex-col gap-3'>
        {result.error && (
          <p>{result.error}</p>
        )}
        {!result.error && result.data && result.data.length === 0 && (
          <p>No rooms with lights found.</p>
        )}
        {!result.error && result.data && result.data.length > 0 && (
          result.data.map((group) => (
            <LightSlider key={group.id} ikeaLightGroup={group} />
          ))
        )}
      </div>
    </Card>
  )
}
