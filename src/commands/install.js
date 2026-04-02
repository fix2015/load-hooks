'use strict';

const chalk = require('chalk');
const ora = require('ora');
const { findHook, searchHooks } = require('../registry');
const { installHook } = require('../installer');

module.exports = async function install(name, options = {}) {
  const spinner = ora(`Searching for hook "${name}"...`).start();

  try {
    let hook = findHook(name);

    if (!hook) {
      // Try fuzzy search
      const matches = searchHooks(name);
      if (matches.length === 0) {
        spinner.fail(chalk.red(`Hook "${name}" not found.`));
        console.log(chalk.yellow('\nTry:'));
        console.log(`  load-hooks search ${name}`);
        console.log('  load-hooks list');
        process.exit(1);
      }
      if (matches.length === 1) {
        hook = matches[0];
        spinner.info(chalk.yellow(`Exact match not found. Using: ${hook.name}`));
      } else {
        spinner.warn(chalk.yellow(`Multiple matches found for "${name}":`));
        console.log('');
        matches.slice(0, 10).forEach(h => {
          console.log(`  ${chalk.cyan(h.name.padEnd(30))} ${chalk.gray(h.description.slice(0, 60))}`);
        });
        if (matches.length > 10) {
          console.log(chalk.gray(`  ... and ${matches.length - 10} more`));
        }
        console.log(chalk.yellow(`\nSpecify the exact name: load-hooks install <name>`));
        process.exit(1);
      }
    }

    const tool = options.tool || 'claude-code';
    spinner.text = `Installing ${chalk.cyan(hook.name)} for ${chalk.green(tool)}...`;
    spinner.start();

    const result = await installHook(hook, options);

    spinner.succeed(
      chalk.green(`Installed ${chalk.bold(hook.name)} → ${chalk.underline(result.installPath)}`)
    );
    console.log(chalk.gray(`  Source: ${hook.source} | Size: ${(result.size / 1024).toFixed(1)}KB`));
    console.log(chalk.gray(`  Tags: ${hook.tags.join(', ')}`));
    if (hook.event) {
      console.log(chalk.gray(`  Event: ${hook.event}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Installation failed: ${err.message}`));
    process.exit(1);
  }
};
