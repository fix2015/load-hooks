# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

`load-hooks` is a CLI tool (published to npm) that aggregates AI coding hooks from multiple sources into a single searchable registry. Users run `npx load-hooks install <name>` to install hooks for Claude Code, Cursor, or Codex.

## Commands

```bash
npm install          # Install dependencies
npm test             # Run all tests (node:test runner)
npm run scrape       # Rebuild registry from GitHub sources (needs network)
node bin/load-hooks.js --help   # Test CLI locally
```

Run a single test file:
```bash
node --test test/registry.test.js
```

## Architecture

- **`bin/load-hooks.js`** -- CLI entry point (shebang, commander arg parsing, routes to commands)
- **`src/commands/`** -- One file per CLI command (install, list, search, info, tags, sources, update). Each exports a single function.
- **`src/registry.js`** -- Core module: loads `data/hooks-registry.json`, provides search/filter/find functions. Used by all commands and the public API.
- **`src/installer.js`** -- Fetches hook files from raw URLs and writes to the correct tool-specific path (`~/.claude/hooks/`, `.cursor/hooks/`, etc.)
- **`src/scraper/index.js`** -- Standalone script that hits GitHub API to discover hooks across configured repos and rebuilds the registry JSON. Also exports `inferTags` and `parseYamlFrontmatter` utilities.
- **`src/index.js`** -- Public programmatic API (re-exports from registry + installer)
- **`data/hooks-registry.json`** -- The hook index: sources array + hooks array. Each hook has name, description, tags, source, compatible tools, raw_url, repo_url, event. This is the single source of truth shipped with the npm package.

## Key Design Decisions

- Uses CommonJS (`require`) and chalk v4 / ora v5 (CJS-compatible versions) to avoid ESM complications with `npx`
- `commander` for CLI parsing (not custom arg parsing) -- all commands are registered in `bin/load-hooks.js`
- The registry is a single JSON file cached in memory (not a database) -- `clearCache()` must be called after writes
- Hooks are fetched at install-time from raw URLs, not bundled
- The scraper uses `inferTags()` to auto-tag hooks based on keyword matching against name + description
- Node.js built-in test runner (`node:test` + `node:assert`) -- no test framework dependency

## Hook Events (Claude Code)

Claude Code hooks run shell commands on specific events:
- **PreToolUse** -- Before a tool runs (can block the tool)
- **PostToolUse** -- After a tool completes
- **Notification** -- When a notification is triggered
- **Stop** -- When the agent stops

## Adding a New Hook Source

1. Add source config to the `SOURCES` array in `src/scraper/index.js`
2. Add source entry to `data/hooks-registry.json` sources array
3. Run `npm run scrape` to populate hooks from the new source

## Adding a New Target Tool

Add path config to `TOOL_PATHS` in `src/installer.js` (global and local paths).
