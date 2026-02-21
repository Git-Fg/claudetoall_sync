import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sync } from "./sync.js";

describe("sync", () => {
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

  it("returns empty result when no targets detected", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "Instructions");
    const result = await sync({ rootDir: tmpDir });
    expect(result.items).toEqual([]);
  });

  it("dry-run does not write files", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "Instructions");
    await mkdir(join(tmpDir, ".github"), { recursive: true });
    const result = await sync({ rootDir: tmpDir, dryRun: true, only: ["copilot"] });
    expect(result.items[0]?.status).toBe("created");
    // File should NOT exist after dry run
    let fileExists = false;
    try {
      await readFile(join(tmpDir, ".github", "copilot-instructions.md"), "utf-8");
      fileExists = true;
    } catch {
      fileExists = false;
    }
    expect(fileExists).toBe(false);
  });

  it("writes files when not dry-run", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "Instructions content");
    const result = await sync({ rootDir: tmpDir, only: ["copilot"] });
    expect(result.items[0]?.status).toBe("created");
    const written = await readFile(join(tmpDir, ".github", "copilot-instructions.md"), "utf-8");
    expect(written).toBe("Instructions content");
  });

  it("reports updated status when file content changes", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "New content");
    await mkdir(join(tmpDir, ".github"), { recursive: true });
    await writeFile(join(tmpDir, ".github", "copilot-instructions.md"), "Old content");
    const result = await sync({ rootDir: tmpDir, only: ["copilot"] });
    expect(result.items[0]?.status).toBe("updated");
  });

  it("reports no-change status when content is the same", async () => {
    await writeFile(join(tmpDir, "CLAUDE.md"), "Same content");
    await mkdir(join(tmpDir, ".github"), { recursive: true });
    await writeFile(join(tmpDir, ".github", "copilot-instructions.md"), "Same content");
    const result = await sync({ rootDir: tmpDir, only: ["copilot"] });
    expect(result.items[0]?.status).toBe("no-change");
  });

  it("reports skipped when mainInstructions is null", async () => {
    // No CLAUDE.md
    const result = await sync({ rootDir: tmpDir, only: ["copilot"] });
    expect(result.items[0]?.status).toBe("skipped");
  });
});
