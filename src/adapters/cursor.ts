import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ClaudeContent } from "../discover/sources.js";

export async function syncCursor(rootDir: string, content: ClaudeContent): Promise<string | null> {
  if (content.mainInstructions === null) return null;
  const dir = join(rootDir, ".cursor", "rules");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, "claude.mdc");
  const fileContent = `---\ndescription: Claude instructions\n---\n${content.mainInstructions}`;
  await writeFile(outPath, fileContent, "utf-8");
  return outPath;
}
