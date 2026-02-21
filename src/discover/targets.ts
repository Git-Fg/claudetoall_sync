import { access } from "node:fs/promises";
import { join } from "node:path";

export type TargetId = "cursor" | "copilot" | "gemini" | "codex" | "cline" | "windsurf";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function discoverTargets(rootDir: string, only?: string[]): Promise<TargetId[]> {
  if (only !== undefined && only.length > 0) {
    return only as TargetId[];
  }

  const discovered: TargetId[] = [];

  if (await exists(join(rootDir, ".cursor", "rules"))) {
    discovered.push("cursor");
  }

  if (
    (await exists(join(rootDir, ".github", "copilot-instructions.md"))) ||
    (await exists(join(rootDir, ".github")))
  ) {
    discovered.push("copilot");
  }

  if (await exists(join(rootDir, ".gemini"))) {
    discovered.push("gemini");
  }

  if (await exists(join(rootDir, "AGENTS.md"))) {
    discovered.push("codex");
  }

  if (await exists(join(rootDir, ".cline"))) {
    discovered.push("cline");
  }

  if (await exists(join(rootDir, ".windsurf"))) {
    discovered.push("windsurf");
  }

  return discovered;
}
