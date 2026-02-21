import { readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { syncCline } from "./adapters/cline.js";
import { syncCodex } from "./adapters/codex.js";
import { syncCopilot } from "./adapters/copilot.js";
import { syncCursor } from "./adapters/cursor.js";
import { syncGemini } from "./adapters/gemini.js";
import { syncWindsurf } from "./adapters/windsurf.js";
import type { ClaudeContent } from "./discover/sources.js";
import { discoverSources } from "./discover/sources.js";
import { discoverTargets } from "./discover/targets.js";
import type { TargetId } from "./discover/targets.js";

export type SyncOptions = {
  rootDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
  only?: string[];
};

export type SyncResultItem = {
  target: string;
  path: string;
  status: "created" | "updated" | "no-change" | "skipped";
};

export type SyncResult = {
  items: SyncResultItem[];
};

type AdapterFn = (rootDir: string, content: ClaudeContent) => Promise<string | null>;

const ADAPTERS: Record<TargetId, AdapterFn> = {
  cursor: syncCursor,
  copilot: syncCopilot,
  gemini: syncGemini,
  codex: syncCodex,
  cline: syncCline,
  windsurf: syncWindsurf,
};

function getOutputPath(target: TargetId, rootDir: string): string {
  switch (target) {
    case "cursor":
      return join(rootDir, ".cursor", "rules", "claude.mdc");
    case "copilot":
      return join(rootDir, ".github", "copilot-instructions.md");
    case "gemini":
      return join(rootDir, ".gemini", "GEMINI.md");
    case "codex":
      return join(rootDir, "AGENTS.md");
    case "cline":
      return join(rootDir, ".cline", "instructions.md");
    case "windsurf":
      return join(rootDir, ".windsurf", "rules.md");
  }
}

function buildContent(target: TargetId, mainInstructions: string): string {
  if (target === "cursor") {
    return `---\ndescription: Claude instructions\n---\n${mainInstructions}`;
  }
  return mainInstructions;
}

async function computeStatus(
  outPath: string,
  newContent: string,
): Promise<"created" | "updated" | "no-change"> {
  try {
    const existing = await readFile(outPath, "utf-8");
    return existing === newContent ? "no-change" : "updated";
  } catch {
    return "created";
  }
}

export async function sync(options?: SyncOptions): Promise<SyncResult> {
  const rootDir = resolve(options?.rootDir ?? process.cwd());
  const dryRun = options?.dryRun ?? false;
  const only = options?.only;

  const claudeContent = await discoverSources(rootDir);
  const targets = await discoverTargets(rootDir, only);

  const items: SyncResultItem[] = [];

  for (const target of targets) {
    const adapter = ADAPTERS[target];
    if (!adapter) continue;

    if (claudeContent.mainInstructions === null) {
      items.push({ target, path: "", status: "skipped" });
      continue;
    }

    const outPath = getOutputPath(target, rootDir);
    const newContent = buildContent(target, claudeContent.mainInstructions);
    const status = await computeStatus(outPath, newContent);

    if (!dryRun) {
      await adapter(rootDir, claudeContent);
    }

    items.push({ target, path: relative(rootDir, outPath), status });
  }

  return { items };
}
