#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const pkg = require('../package.json');

const installCmd = require('../src/commands/install');
const listCmd = require('../src/commands/list');
const searchCmd = require('../src/commands/search');
const infoCmd = require('../src/commands/info');
const updateCmd = require('../src/commands/update');
const tagsCmd = require('../src/commands/tags');
const sourcesCmd = require('../src/commands/sources');

program
  .name('load-hooks')
  .version(pkg.version)
  .description('Discover, search, and install hooks for Claude Code, Cursor, Codex, and more');

program
  .command('install <name>')
  .alias('i')
  .description('Install a hook by name')
  .option('-t, --tool <tool>', 'Target tool: claude-code, cursor, codex (default: claude-code)', 'claude-code')
  .option('-g, --global', 'Install globally for the tool (e.g. ~/.claude/hooks/)')
  .option('-o, --output <path>', 'Custom output path for the hook file')
  .action(installCmd);

program
  .command('list')
  .alias('ls')
  .description('List all available hooks')
  .option('-s, --source <source>', 'Filter by source')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('--tool <tool>', 'Filter by compatible tool')
  .option('-j, --json', 'Output as JSON')
  .action(listCmd);

program
  .command('search <query>')
  .alias('s')
  .description('Search hooks by name, description, or tags')
  .option('-t, --tag <tag>', 'Also filter by tag')
  .option('--tool <tool>', 'Filter by compatible tool')
  .option('-j, --json', 'Output as JSON')
  .action(searchCmd);

program
  .command('info <name>')
  .description('Show detailed information about a hook')
  .option('-j, --json', 'Output as JSON')
  .action(infoCmd);

program
  .command('tags')
  .description('List all available tags with hook counts')
  .action(tagsCmd);

program
  .command('sources')
  .description('List all hook sources/repositories')
  .action(sourcesCmd);

program
  .command('update')
  .description('Update the hooks registry from remote sources')
  .action(updateCmd);

// Default: if first arg matches a hook name, install it
program.arguments('[name]').action((name, opts) => {
  if (name) {
    installCmd(name, { tool: 'claude-code' });
  } else {
    program.help();
  }
});

program.parse(process.argv);
