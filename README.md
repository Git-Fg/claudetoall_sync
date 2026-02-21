# claudetoall_sync

A Node.js CLI tool that reads your Claude configuration (`CLAUDE.md`, `.claude/`) and propagates it to all other AI agents detected in your repository.

**Claude is the source of truth.** This tool never writes to Claude's files — it only reads from them and syncs the content to every other agent that's already set up.

## Installation

```bash
npm install -g claudetoall_sync
```

## Usage

```bash
# Run sync with auto-discovery (default)
claudetoall_sync

# Show what would change without writing
claudetoall_sync --dry-run

# Show verbose output including skipped items
claudetoall_sync --verbose

# Override target filter
claudetoall_sync --only cursor,copilot
```

## How it works

### Source discovery

Reads Claude files from your repo:

- `CLAUDE.md` — main instructions
- `.claude/commands/*.md` — slash commands
- `.claude/settings.json` — MCP config, permissions
- `.claude/agents/*.md` — subagents

### Target discovery

Detects which agents are already set up by looking for sentinel files/folders:

| Sentinel         | Agent          |
| ---------------- | -------------- |
| `.cursor/rules/` | Cursor         |
| `.github/`       | GitHub Copilot |
| `.gemini/`       | Gemini CLI     |
| `AGENTS.md`      | Codex/OpenAI   |
| `.cline/`        | Cline          |
| `.windsurf/`     | Windsurf       |

Only discovered targets get synced to. If an agent folder doesn't exist, it is silently skipped.

### Output

```
✔ .cursor/rules/claude.mdc  (updated)
✔ .github/copilot-instructions.md  (no change)
✔ AGENTS.md  (created)
```

## Design principles

- **Zero config to start** — run in any repo, it auto-discovers what exists
- **Idempotent** — running it twice produces no changes the second time
- **Additive only** — never deletes existing agent configs, only creates or updates
- **Stateless** — no cache, no state file, recomputes from scratch on every run

## License

MIT License
