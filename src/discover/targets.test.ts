import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverTargets } from "./targets.js";

describe("discoverTargets", () => {
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

  it("returns empty array when no sentinels exist", async () => {
    const result = await discoverTargets(tmpDir);
    expect(result).toEqual([]);
  });

  it("detects cursor when .cursor/rules/ directory exists", async () => {
    await mkdir(join(tmpDir, ".cursor", "rules"), { recursive: true });
    const result = await discoverTargets(tmpDir);
    expect(result).toContain("cursor");
  });

  it("detects copilot when .github/ directory exists", async () => {
    await mkdir(join(tmpDir, ".github"), { recursive: true });
    const result = await discoverTargets(tmpDir);
    expect(result).toContain("copilot");
  });

  it("detects codex when AGENTS.md exists", async () => {
    await writeFile(join(tmpDir, "AGENTS.md"), "agents");
    const result = await discoverTargets(tmpDir);
    expect(result).toContain("codex");
  });

  it("detects cline when .cline/ directory exists", async () => {
    await mkdir(join(tmpDir, ".cline"), { recursive: true });
    const result = await discoverTargets(tmpDir);
    expect(result).toContain("cline");
  });

  it("detects windsurf when .windsurf/ directory exists", async () => {
    await mkdir(join(tmpDir, ".windsurf"), { recursive: true });
    const result = await discoverTargets(tmpDir);
    expect(result).toContain("windsurf");
  });

  it("detects gemini when .gemini/ directory exists", async () => {
    await mkdir(join(tmpDir, ".gemini"), { recursive: true });
    const result = await discoverTargets(tmpDir);
    expect(result).toContain("gemini");
  });

  it("returns only specified targets when only parameter is provided", async () => {
    await mkdir(join(tmpDir, ".cursor", "rules"), { recursive: true });
    await mkdir(join(tmpDir, ".github"), { recursive: true });
    const result = await discoverTargets(tmpDir, ["cursor"]);
    expect(result).toEqual(["cursor"]);
    expect(result).not.toContain("copilot");
  });

  it("includes non-detected targets when only parameter is provided", async () => {
    // No sentinels, but we force copilot via only
    const result = await discoverTargets(tmpDir, ["copilot"]);
    expect(result).toEqual(["copilot"]);
  });
});
