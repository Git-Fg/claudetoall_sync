import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export type ClaudeCommand = { name: string; content: string };
export type ClaudeAgent = { name: string; content: string };
export type ClaudeContent = {
  mainInstructions: string | null;
  commands: ClaudeCommand[];
  settings: Record<string, unknown> | null;
  agents: ClaudeAgent[];
};

export async function discoverSources(rootDir: string): Promise<ClaudeContent> {
  // Read CLAUDE.md
  let mainInstructions: string | null = null;
  try {
    mainInstructions = await readFile(join(rootDir, "CLAUDE.md"), "utf-8");
  } catch {
    // file not found
  }

  // Read .claude/commands/*.md
  const commands: ClaudeCommand[] = [];
  try {
    const commandsDir = join(rootDir, ".claude", "commands");
    const files = await readdir(commandsDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = await readFile(join(commandsDir, file), "utf-8");
        commands.push({ name: file.replace(/\.md$/, ""), content });
      }
    }
  } catch {
    // directory not found
  }

  // Read .claude/settings.json
  let settings: Record<string, unknown> | null = null;
  try {
    const raw = await readFile(join(rootDir, ".claude", "settings.json"), "utf-8");
    settings = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // file not found or invalid JSON
  }

  // Read .claude/agents/*.md
  const agents: ClaudeAgent[] = [];
  try {
    const agentsDir = join(rootDir, ".claude", "agents");
    const files = await readdir(agentsDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = await readFile(join(agentsDir, file), "utf-8");
        agents.push({ name: file.replace(/\.md$/, ""), content });
      }
    }
  } catch {
    // directory not found
  }

  return { mainInstructions, commands, settings, agents };
}
