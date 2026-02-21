import crypto from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const originalCwd = process.cwd();

export async function setupTestDirectory({ home }: { home: boolean } = { home: false }): Promise<{
  testDir: string;
  cleanup: () => Promise<void>;
}> {
  const testsDir = join(originalCwd, "tmp", "tests");
  const testDir = home
    ? join(testsDir, "home", randomString(16))
    : join(testsDir, "projects", randomString(16));
  await mkdir(testDir, { recursive: true });

  const cleanup = () => rm(testDir, { recursive: true, force: true });
  return { testDir, cleanup };
}

function randomString(length: number) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}
