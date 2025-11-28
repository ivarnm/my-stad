import Card from 'src/components/ui/Card'
import { getIkeaLightGroups } from 'src/server/actions/ikea';
import LightSlider from './LightSlider';

export default async function LightControlsCard() {
  const result = await getIkeaLightGroups();


  return (
    <Card>
      <div className='flex gap-2 items-center mb-3'>
        <span className="material-symbols-outlined">
          lightbulb
        </span>
        <h2 className="text-xl font-bold">Lights</h2>
      </div>
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
