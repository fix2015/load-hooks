'use strict';

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const os = require('os');

const TOOL_PATHS = {
  'claude-code': {
    global: path.join(os.homedir(), '.claude', 'hooks'),
    local: '.claude/hooks',
  },
  'cursor': {
    global: path.join(os.homedir(), '.cursor', 'hooks'),
    local: '.cursor/hooks',
  },
  'codex': {
    global: path.join(os.homedir(), '.codex', 'hooks'),
    local: '.codex/hooks',
  },
};

async function fetchHookContent(hook) {
  if (!hook.raw_url) {
    throw new Error(`No download URL available for hook "${hook.name}". Visit: ${hook.repo_url}`);
  }

  const response = await fetch(hook.raw_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch hook: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function getInstallPath(hook, { tool = 'claude-code', global: isGlobal = false, output } = {}) {
  if (output) return output;

  const toolConfig = TOOL_PATHS[tool];
  if (!toolConfig) {
    throw new Error(`Unknown tool: ${tool}. Supported: ${Object.keys(TOOL_PATHS).join(', ')}`);
  }

  const base = isGlobal ? toolConfig.global : toolConfig.local;
  const ext = hook.raw_url && hook.raw_url.endsWith('.sh') ? '.sh' : '.js';

  return path.join(base, `${hook.name}${ext}`);
}

async function installHook(hook, options = {}) {
  const content = await fetchHookContent(hook);
  const installPath = getInstallPath(hook, options);
  const dir = path.dirname(installPath);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(installPath, content, 'utf-8');

  // Make hook executable
  fs.chmodSync(installPath, '755');

  return { installPath, size: content.length };
}

module.exports = {
  fetchHookContent,
  getInstallPath,
  installHook,
  TOOL_PATHS,
};
