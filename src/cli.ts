#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";

import { sync } from "./sync.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8")) as {
  version: string;
};

const program = new Command();

program
  .name("claudetoall_sync")
  .description("Sync Claude's config to all detected AI agents")
  .version(pkg.version)
  .option("--dry-run", "Show what would change without writing")
  .option("--verbose", "Show verbose output including skipped items")
  .option("--only <targets>", "Comma-separated list of targets to sync to (e.g., cursor,copilot)")
  .action(async (opts: { dryRun?: boolean; verbose?: boolean; only?: string }) => {
    const only = opts.only ? opts.only.split(",").map((s) => s.trim()) : undefined;

    const result = await sync({
      dryRun: opts.dryRun,
      verbose: opts.verbose,
      only,
    });

    for (const item of result.items) {
      if (item.status === "skipped") {
        if (opts.verbose) {
          console.log(`⊘ ${item.target}  (skipped)`);
        }
      } else {
        console.log(`✔ ${item.path}  (${item.status})`);
      }
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
