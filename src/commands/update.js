'use strict';

const chalk = require('chalk');
const ora = require('ora');
const fetch = require('node-fetch');
const fs = require('fs');
const { REGISTRY_PATH, clearCache, loadRegistry } = require('../registry');

const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'community',
    repo: 'anthropics/claude-code-hooks',
    path: 'hooks',
    type: 'community',
  },
];

async function fetchRepoHooks(source) {
  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'load-hooks-cli',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error for ${source.repo}: ${response.status}`);
  }

  const items = await response.json();
  return items
    .filter(item => item.type === 'file' && (item.name.endsWith('.js') || item.name.endsWith('.sh')))
    .map(item => item.name.replace(/\.(js|sh)$/, ''));
}

module.exports = async function update() {
  const spinner = ora('Checking for registry updates...').start();

  try {
    let newHooksFound = 0;
    const registry = loadRegistry();
    const existingNames = new Set(registry.hooks.map(h => h.name));

    for (const source of SOURCES) {
      spinner.text = `Scanning ${chalk.cyan(source.repo)}...`;
      try {
        const hookNames = await fetchRepoHooks(source);
        for (const name of hookNames) {
          if (!existingNames.has(name)) {
            registry.hooks.push({
              name,
              description: `Hook from ${source.repo} (run "load-hooks info ${name}" after next update)`,
              tags: [],
              source: source.id,
              compatible: ['claude-code'],
              raw_url: `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${name}.js`,
              repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
              event: '',
            });
            existingNames.add(name);
            newHooksFound++;
          }
        }
      } catch (err) {
        spinner.warn(chalk.yellow(`Failed to scan ${source.repo}: ${err.message}`));
        spinner.start();
      }
    }

    registry.updated_at = new Date().toISOString().split('T')[0];
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    clearCache();

    if (newHooksFound > 0) {
      spinner.succeed(chalk.green(`Registry updated! Found ${newHooksFound} new hook(s). Total: ${registry.hooks.length}`));
    } else {
      spinner.succeed(chalk.green(`Registry is up to date. Total hooks: ${registry.hooks.length}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Update failed: ${err.message}`));
    process.exit(1);
  }
};
