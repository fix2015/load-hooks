# load-hooks

> CLI tool to discover, search, and install hooks for Claude Code, Cursor, Codex, and more AI coding tools.

[![npm version](https://img.shields.io/npm/v/load-hooks.svg)](https://www.npmjs.com/package/load-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**load-hooks** aggregates hooks from multiple sources into a single searchable registry, letting you install any hook with one command. No more manually writing shell scripts or copying configuration files.

## What Are Hooks?

Hooks are automation scripts that run on specific events in your AI coding tool. In Claude Code, hooks are configured in `settings.json` and execute shell commands when events occur:

- **PreToolUse** -- Runs before a tool executes (can block it). Use for security scanning, file protection, validation.
- **PostToolUse** -- Runs after a tool completes. Use for auto-linting, formatting, test running.
- **Notification** -- Triggered on notifications. Use for Slack/Discord alerts.
- **Stop** -- Runs when the agent stops. Use for session summaries, cleanup.

## Quick Start

```bash
# Install a hook instantly (no install needed)
npx load-hooks install auto-lint

# Or install globally
npm install -g load-hooks
load-hooks install secret-scanner
```

## Features

- **25+ hooks** covering security, linting, testing, CI/CD, notifications, and more
- **Multi-tool support** -- install hooks for Claude Code, Cursor, or Codex
- **Fast search** -- find hooks by name, description, tags, or event type
- **Auto-scraper** -- update the registry from GitHub sources with `load-hooks update`
- **Programmatic API** -- use as a library in your own tools

## Commands

### Install a hook

```bash
load-hooks install <name>                # Install for Claude Code (default)
load-hooks install <name> --tool cursor  # Install for Cursor
load-hooks install <name> --global       # Install globally (~/.claude/hooks/)
load-hooks install <name> -o ./my-path   # Custom output path
load-hooks <name>                        # Shorthand for install
```

### Search & browse

```bash
load-hooks list                      # List all hooks
load-hooks list --source community   # Filter by source
load-hooks list --tag security       # Filter by tag
load-hooks list --tool cursor        # Filter by compatible tool

load-hooks search security           # Search by keyword
load-hooks search "auto" --tag linting

load-hooks info auto-lint            # Detailed info about a hook
load-hooks tags                      # Show all tags with counts
load-hooks sources                   # Show all hook sources
```

### Update registry

```bash
load-hooks update                    # Fetch latest hooks from GitHub
GITHUB_TOKEN=ghp_xxx load-hooks update  # Use token for higher rate limits
```

### JSON output

```bash
load-hooks list --json               # Machine-readable output
load-hooks search security --json
load-hooks info auto-lint --json
```

## Supported Tools

| Tool | Install Location (local) | Install Location (global) |
|------|-------------------------|--------------------------|
| Claude Code | `.claude/hooks/<name>.js` | `~/.claude/hooks/<name>.js` |
| Cursor | `.cursor/hooks/<name>.js` | `~/.cursor/hooks/<name>.js` |
| Codex | `.codex/hooks/<name>.js` | `~/.codex/hooks/<name>.js` |

## Hook Categories

| Category | Examples | Event |
|----------|---------|-------|
| Security | secret-scanner, file-guard, license-checker | PreToolUse |
| Linting | auto-lint, auto-format | PostToolUse |
| Testing | test-runner | PostToolUse |
| Git | commit-message-validator, branch-protection | PreToolUse |
| CI/CD | build-verification, deploy-gate, bundle-size-check | Pre/PostToolUse |
| Documentation | doc-generator, changelog-updater | PostToolUse |
| Notifications | notification-slack, notification-discord | Notification |
| Performance | performance-budget, bundle-size-check | PreToolUse |
| Accessibility | accessibility-audit | PostToolUse |

## Claude Code Hook Configuration

After installing a hook, configure it in your Claude Code `settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/secret-scanner.js $FILEPATH"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/auto-lint.js $FILEPATH"
          }
        ]
      }
    ]
  }
}
```

## Programmatic API

```javascript
const { findHook, searchHooks, installHook } = require('load-hooks');

// Search
const results = searchHooks('security', { tag: 'pre-tool-use' });

// Get hook info
const hook = findHook('auto-lint');

// Install programmatically
await installHook(hook, { tool: 'claude-code', global: true });
```

## Rebuild the Registry

The scraper fetches hook metadata from all configured GitHub sources:

```bash
npm run scrape                          # Rebuild from GitHub
GITHUB_TOKEN=ghp_xxx npm run scrape     # With auth for higher rate limits
```

## Contributing

1. Fork the repo
2. Add hooks to `data/hooks-registry.json` or add a new source in `src/scraper/index.js`
3. Submit a PR

### Adding a new hook source

Add an entry to the `SOURCES` array in `src/scraper/index.js`:

```javascript
{
  id: 'your-source',
  repo: 'owner/repo',
  path: 'hooks',
  type: 'community',
  url: 'https://github.com/owner/repo',
  compatible: ['claude-code', 'cursor'],
}
```

## License

MIT
