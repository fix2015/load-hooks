#!/usr/bin/env node

'use strict';

/**
 * Scraper that fetches hooks from GitHub repositories and rebuilds
 * the local hooks-registry.json. Run with: npm run scrape
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'hooks-registry.json');
const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'community',
    repo: 'anthropics/claude-code-hooks',
    path: 'hooks',
    type: 'community',
    url: 'https://github.com/anthropics/claude-code-hooks',
    compatible: ['claude-code'],
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function githubFetch(url) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'load-hooks-scraper',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 403) {
    const resetTime = response.headers.get('x-ratelimit-reset');
    if (resetTime) {
      const waitMs = (parseInt(resetTime) * 1000) - Date.now() + 1000;
      console.log(`  Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
      return githubFetch(url);
    }
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchHookFiles(source) {
  if (!source.path) return [];

  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  try {
    const items = await githubFetch(url);
    return items
      .filter(item => item.type === 'file' && (item.name.endsWith('.js') || item.name.endsWith('.sh')))
      .map(item => item.name);
  } catch (err) {
    console.error(`  Error fetching ${source.repo}: ${err.message}`);
    return [];
  }
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function inferTags(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const tagMap = {
    'security': ['security', 'secret', 'scan', 'vulnerability', 'owasp', 'auth', 'license'],
    'linting': ['lint', 'eslint', 'prettier', 'format', 'style'],
    'testing': ['test', 'jest', 'mocha', 'cypress', 'playwright', 'coverage'],
    'git': ['commit', 'branch', 'push', 'merge', 'git', 'pre-commit', 'post-commit'],
    'ci-cd': ['ci', 'cd', 'deploy', 'build', 'pipeline', 'gate'],
    'documentation': ['doc', 'readme', 'changelog', 'comment'],
    'performance': ['performance', 'budget', 'bundle', 'size', 'speed'],
    'accessibility': ['accessibility', 'a11y', 'aria', 'wcag'],
    'automation': ['auto', 'hook', 'trigger', 'notification', 'watch'],
    'code-quality': ['quality', 'review', 'complexity', 'refactor', 'type-check', 'typescript'],
    'dependency': ['dependency', 'deps', 'audit', 'outdated', 'npm'],
    'pre-tool-use': ['pre-tool', 'before'],
    'post-tool-use': ['post-tool', 'after'],
  };

  const tags = new Set();
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(k => text.includes(k))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

async function scrapeAll() {
  console.log('Scraping hooks from GitHub repositories...\n');

  const hooks = [];
  const seenNames = new Set();

  for (const source of SOURCES) {
    console.log(`Scanning ${source.repo}...`);

    const files = await fetchHookFiles(source);
    console.log(`   Found ${files.length} hook files`);

    for (const file of files) {
      const name = file.replace(/\.(js|sh)$/, '');
      if (seenNames.has(name)) {
        console.log(`   Skipping duplicate: ${name}`);
        continue;
      }

      const tags = inferTags(name, '');

      hooks.push({
        name,
        description: `${name.replace(/-/g, ' ')} hook from ${source.repo}`,
        tags,
        source: source.id,
        compatible: source.compatible,
        raw_url: `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${file}`,
        repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${file}`,
        event: '',
      });

      seenNames.add(name);
    }

    console.log('');
  }

  const registry = {
    version: '1.0.0',
    updated_at: new Date().toISOString().split('T')[0],
    sources: SOURCES.map(({ id, repo, path: p, type, url }) => ({ id, repo, path: p, type, url })),
    hooks,
  };

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Saved ${hooks.length} hooks to ${REGISTRY_PATH}`);
}

// Run if executed directly
if (require.main === module) {
  scrapeAll().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  });
}

module.exports = { scrapeAll, inferTags, parseYamlFrontmatter };
