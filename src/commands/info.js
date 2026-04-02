'use strict';

const chalk = require('chalk');
const { findHook, searchHooks } = require('../registry');

module.exports = function info(name, options = {}) {
  let hook = findHook(name);

  if (!hook) {
    const matches = searchHooks(name);
    if (matches.length === 1) {
      hook = matches[0];
    } else if (matches.length > 1) {
      console.log(chalk.yellow(`Multiple matches for "${name}":`));
      matches.slice(0, 5).forEach(h => {
        console.log(`  ${chalk.cyan(h.name)}`);
      });
      return;
    } else {
      console.log(chalk.red(`Hook "${name}" not found.`));
      return;
    }
  }

  if (options.json) {
    console.log(JSON.stringify(hook, null, 2));
    return;
  }

  console.log('');
  console.log(chalk.bold.cyan(`  ${hook.name}`));
  console.log(chalk.gray('  ' + '\u2500'.repeat(50)));
  console.log(`  ${chalk.bold('Description:')}  ${hook.description}`);
  console.log(`  ${chalk.bold('Source:')}       ${hook.source}`);
  console.log(`  ${chalk.bold('Event:')}        ${hook.event || 'n/a'}`);
  console.log(`  ${chalk.bold('Tags:')}         ${hook.tags.join(', ')}`);
  console.log(`  ${chalk.bold('Compatible:')}   ${hook.compatible.join(', ')}`);
  console.log(`  ${chalk.bold('Repo:')}         ${chalk.underline(hook.repo_url)}`);
  if (hook.raw_url) {
    console.log(`  ${chalk.bold('Raw URL:')}      ${chalk.underline(hook.raw_url)}`);
  }
  console.log('');
  console.log(chalk.gray(`  Install: load-hooks install ${hook.name}`));
  console.log(chalk.gray(`  Install for Cursor: load-hooks install ${hook.name} --tool cursor`));
  console.log('');
};
