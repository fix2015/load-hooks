'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  getAllHooks,
  findHook,
  searchHooks,
  filterHooks,
  getAllTags,
  getSources,
} = require('../src/registry');

describe('Registry', () => {
  it('should load all hooks', () => {
    const hooks = getAllHooks();
    assert.ok(hooks.length > 0, 'Should have at least one hook');
  });

  it('should find hook by exact name', () => {
    const hook = findHook('auto-lint');
    assert.ok(hook, 'Should find auto-lint');
    assert.strictEqual(hook.name, 'auto-lint');
  });

  it('should find hook case-insensitively', () => {
    const hook = findHook('Auto-Lint');
    assert.ok(hook, 'Should find hook regardless of case');
  });

  it('should return undefined for unknown hook', () => {
    const hook = findHook('nonexistent-hook-xyz');
    assert.strictEqual(hook, undefined);
  });

  it('should search by keyword in name', () => {
    const results = searchHooks('lint');
    assert.ok(results.length > 0, 'Should find lint-related hooks');
    assert.ok(results.some(h => h.name.includes('lint')));
  });

  it('should search by keyword in description', () => {
    const results = searchHooks('security');
    assert.ok(results.length > 0, 'Should find security-related hooks');
  });

  it('should filter by tag', () => {
    const results = searchHooks('', { tag: 'security' });
    assert.ok(results.length > 0);
    assert.ok(results.every(h => h.tags.includes('security')));
  });

  it('should filter by source', () => {
    const results = filterHooks({ source: 'community' });
    assert.ok(results.length > 0);
    assert.ok(results.every(h => h.source === 'community'));
  });

  it('should filter by tool', () => {
    const results = filterHooks({ tool: 'claude-code' });
    assert.ok(results.length > 0);
    assert.ok(results.every(h => h.compatible.includes('claude-code')));
  });

  it('should get all tags with counts', () => {
    const tags = getAllTags();
    assert.ok(tags.length > 0);
    assert.ok(tags[0].tag);
    assert.ok(tags[0].count > 0);
    // Should be sorted by count descending
    for (let i = 1; i < tags.length; i++) {
      assert.ok(tags[i].count <= tags[i - 1].count, 'Tags should be sorted by count desc');
    }
  });

  it('should get sources', () => {
    const sources = getSources();
    assert.ok(sources.length > 0);
    assert.ok(sources[0].id);
    assert.ok(sources[0].repo);
  });

  it('every hook should have required fields', () => {
    const hooks = getAllHooks();
    for (const hook of hooks) {
      assert.ok(hook.name, `Hook missing name`);
      assert.ok(hook.description, `Hook ${hook.name} missing description`);
      assert.ok(Array.isArray(hook.tags), `Hook ${hook.name} tags should be array`);
      assert.ok(hook.source, `Hook ${hook.name} missing source`);
      assert.ok(Array.isArray(hook.compatible), `Hook ${hook.name} compatible should be array`);
    }
  });
});
