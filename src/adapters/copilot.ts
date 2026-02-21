import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ClaudeContent } from "../discover/sources.js";

export async function syncCopilot(rootDir: string, content: ClaudeContent): Promise<string | null> {
  if (content.mainInstructions === null) return null;
  const dir = join(rootDir, ".github");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, "copilot-instructions.md");
  await writeFile(outPath, content.mainInstructions, "utf-8");
  return outPath;
}
