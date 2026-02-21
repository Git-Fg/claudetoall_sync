import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ClaudeContent } from "../discover/sources.js";

export async function syncWindsurf(rootDir: string, content: ClaudeContent): Promise<string | null> {
  if (content.mainInstructions === null) return null;
  const dir = join(rootDir, ".windsurf");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, "rules.md");
  await writeFile(outPath, content.mainInstructions, "utf-8");
  return outPath;
}
