import { getIkeaLightGroups } from "src/server/actions/ikea";
import IkeaLightControl from "src/components/IkeaLightControl";

export default async function Temp() {
  const result = await getIkeaLightGroups();

  if (result.error) {
    return (
      <div className="flex flex-col items-center h-screen justify-center">
        <h1 className="text-4xl">Error</h1>
        <p className="text-red-500">{result.error}</p>
      </div>
    );
  }

  const lightGroups = result.data || [];

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <h1 className="text-4xl mb-8">My IKEA Smart Home</h1>
      <IkeaLightControl lightGroups={lightGroups} />
    </div>
  );
}
