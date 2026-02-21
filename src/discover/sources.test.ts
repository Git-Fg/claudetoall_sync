import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverSources } from "./sources.js";

describe("discoverSources", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = join(
      tmpdir(),
      `claudetoall_sync_test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    );
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("returns null and empty arrays for an empty directory", async () => {
    const result = await discoverSources(tmpDir);
    expect(result.mainInstructions).toBeNull();
    expect(result.commands).toEqual([]);
    expect(result.settings).toBeNull();
    expect(result.agents).toEqual([]);
  });

  it("reads CLAUDE.md", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "# Instructions\nHello world");
    const result = await discoverSources(tmpDir);
    expect(result.mainInstructions).toBe("# Instructions\nHello world");
  });

  it("reads .claude/commands/*.md files", async () => {
    const commandsDir = join(tmpDir, ".claude", "commands");
    await mkdir(commandsDir, { recursive: true });
    await writeFile(join(commandsDir, "deploy.md"), "Deploy command content");
    await writeFile(join(commandsDir, "test.md"), "Test command content");
    const result = await discoverSources(tmpDir);
    expect(result.commands).toHaveLength(2);
    const names = result.commands.map((c) => c.name).sort();
    expect(names).toEqual(["deploy", "test"]);
  });

  it("reads .claude/settings.json", async () => {
    const claudeDir = join(tmpDir, ".claude");
    await mkdir(claudeDir, { recursive: true });
    await writeFile(join(claudeDir, "settings.json"), JSON.stringify({ model: "claude-3" }));
    const result = await discoverSources(tmpDir);
    expect(result.settings).toEqual({ model: "claude-3" });
  });

  it("reads .claude/agents/*.md files", async () => {
    const agentsDir = join(tmpDir, ".claude", "agents");
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, "reviewer.md"), "Reviewer agent content");
    const result = await discoverSources(tmpDir);
    expect(result.agents).toHaveLength(1);
    expect(result.agents[0]?.name).toBe("reviewer");
    expect(result.agents[0]?.content).toBe("Reviewer agent content");
  });

  it("reads all fields at once", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "Main instructions");
    const claudeDir = join(tmpDir, ".claude");
    await mkdir(join(claudeDir, "commands"), { recursive: true });
    await mkdir(join(claudeDir, "agents"), { recursive: true });
    await writeFile(join(claudeDir, "commands", "cmd.md"), "Command content");
    await writeFile(join(claudeDir, "agents", "agent.md"), "Agent content");
    await writeFile(join(claudeDir, "settings.json"), JSON.stringify({ key: "value" }));
    const result = await discoverSources(tmpDir);
    expect(result.mainInstructions).toBe("Main instructions");
    expect(result.commands).toHaveLength(1);
    expect(result.settings).toEqual({ key: "value" });
    expect(result.agents).toHaveLength(1);
  });
});
