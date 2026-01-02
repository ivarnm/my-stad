import { TransitStop } from ".";

export function addCodesForDuplicateNames(stops: TransitStop[]): TransitStop[] {
  const byName = new Map<string, TransitStop[]>();

  for (const stop of stops) {
    const group = byName.get(stop.name);
    if (group) {
      group.push(stop);
    } else {
      byName.set(stop.name, [stop]);
    }
  }

  const result: TransitStop[] = [];

  for (const [, group] of byName) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));

    sorted.forEach((stop, index) => {
      result.push({
        ...stop,
        code: index + 1,
      });
    });
  }

  return result;
}
