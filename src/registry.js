'use strict';

const path = require('path');
const fs = require('fs');

const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'hooks-registry.json');

let _cache = null;

function loadRegistry() {
  if (_cache) return _cache;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  _cache = JSON.parse(raw);
  return _cache;
}

function getAllHooks() {
  return loadRegistry().hooks;
}

function getSources() {
  return loadRegistry().sources;
}

function getVersion() {
  return loadRegistry().version;
}

function getUpdatedAt() {
  return loadRegistry().updated_at;
}

function findHook(name) {
  const hooks = getAllHooks();
  // Exact match first
  const exact = hooks.find(h => h.name === name);
  if (exact) return exact;
  // Case-insensitive
  const lower = name.toLowerCase();
  return hooks.find(h => h.name.toLowerCase() === lower);
}

function searchHooks(query, { tag, tool } = {}) {
  let hooks = getAllHooks();

  if (tag) {
    hooks = hooks.filter(h => h.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    hooks = hooks.filter(h => h.compatible.includes(tool.toLowerCase()));
  }

  if (!query) return hooks;

  const q = query.toLowerCase();
  return hooks.filter(h => {
    return (
      h.name.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.tags.some(t => t.includes(q))
    );
  });
}

function filterHooks({ source, tag, tool } = {}) {
  let hooks = getAllHooks();
  if (source) {
    hooks = hooks.filter(h => h.source === source);
  }
  if (tag) {
    hooks = hooks.filter(h => h.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    hooks = hooks.filter(h => h.compatible.includes(tool.toLowerCase()));
  }
  return hooks;
}

function getAllTags() {
  const hooks = getAllHooks();
  const tagMap = {};
  for (const hook of hooks) {
    for (const tag of hook.tags) {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    }
  }
  return Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

function clearCache() {
  _cache = null;
}

module.exports = {
  loadRegistry,
  getAllHooks,
  getSources,
  getVersion,
  getUpdatedAt,
  findHook,
  searchHooks,
  filterHooks,
  getAllTags,
  clearCache,
  REGISTRY_PATH,
};
