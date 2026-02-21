import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ClaudeContent } from "../discover/sources.js";

export async function syncCodex(rootDir: string, content: ClaudeContent): Promise<string | null> {
  if (content.mainInstructions === null) return null;
  const outPath = join(rootDir, "AGENTS.md");
  await writeFile(outPath, content.mainInstructions, "utf-8");
  return outPath;
}
