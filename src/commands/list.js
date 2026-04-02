'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { filterHooks } = require('../registry');

module.exports = function list(options = {}) {
  const hooks = filterHooks({
    source: options.source,
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(hooks, null, 2));
    return;
  }

  if (hooks.length === 0) {
    console.log(chalk.yellow('No hooks found matching your filters.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Event'),
      chalk.cyan('Tags'),
    ],
    colWidths: [25, 45, 16, 25],
    wordWrap: true,
    style: { head: [], border: [] },
  });

  for (const hook of hooks) {
    table.push([
      chalk.bold(hook.name),
      hook.description.slice(0, 80),
      chalk.gray(hook.event || 'n/a'),
      chalk.gray(hook.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Available Hooks (${hooks.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-hooks install <name>`));
  console.log(chalk.gray(`Details: load-hooks info <name>`));
};
