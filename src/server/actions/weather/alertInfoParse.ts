import type { WeatherAlertOld } from "./types";
type InfoBlock = WeatherAlertOld["infoBlocks"][0];

/**
 * Parses a single text string into an array of temporary blocks.
 */
function parseTextIntoTempBlocks(text: string): InfoBlock[] {
  const result: InfoBlock[] = [];
  const parts = text
    .split(". ")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let currentBlock: InfoBlock | null = null;

  for (const part of parts) {
    const colonIndex = part.indexOf(":");
    if (colonIndex !== -1) {
      // This part starts a new block
      if (currentBlock) {
        // Finalize the previous block's description.
        // We add back the period that was removed by the split.
        if (
          currentBlock.description &&
          !currentBlock.description.endsWith(".")
        ) {
          currentBlock.description += ".";
        }
        result.push(currentBlock);
      }

      const title = part.substring(0, colonIndex).trim();
      const descriptionStart = part.substring(colonIndex + 1).trim();
      currentBlock = { title, description: descriptionStart };
    } else {
      // This part continues the description of the current block
      if (currentBlock) {
        // We re-join the sentences with the delimiter ". ".
        currentBlock.description +=
          (currentBlock.description ? ". " : "") + part;
      }
    }
  }

  // After the loop, push the last block if it exists
  if (currentBlock) {
    if (currentBlock.description && !currentBlock.description.endsWith(".")) {
      currentBlock.description += ".";
    }
    result.push(currentBlock);
  }

  return result;
}

/**
 * Merges the parsed blocks from consequences and instructions.
 */
export function mergeInfoBlocks(
  eventAwarenessName: string,
  descriptionText: string,
  consequencesText: string,
  instructionText: string
): InfoBlock[] {
  const consequencesBlocks = parseTextIntoTempBlocks(consequencesText);
  const instructionBlocks = parseTextIntoTempBlocks(instructionText);

  const mergedMap = new Map<string, InfoBlock>();

  for (const block of consequencesBlocks) {
    mergedMap.set(block.title, { ...block });
  }

  for (const block of instructionBlocks) {
    if (mergedMap.has(block.title)) {
      const existingBlock = mergedMap.get(block.title)!;
      // Ensure there's a space when concatenating descriptions
      existingBlock.description = (
        existingBlock.description.trim() +
        " " +
        block.description.trim()
      ).trim();
      mergedMap.set(block.title, existingBlock);
    } else {
      mergedMap.set(block.title, { ...block });
    }
  }

  return [
    { title: eventAwarenessName, description: descriptionText },
    ...Array.from(mergedMap.values()),
  ];
}
