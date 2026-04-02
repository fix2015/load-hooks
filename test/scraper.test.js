'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { inferTags, parseYamlFrontmatter } = require('../src/scraper/index');

describe('Scraper utilities', () => {
  describe('inferTags', () => {
    it('should detect security tags', () => {
      const tags = inferTags('secret-scanner', 'Scans for secrets and vulnerabilities');
      assert.ok(tags.includes('security'));
    });

    it('should detect linting tags', () => {
      const tags = inferTags('auto-lint', 'Runs ESLint on code changes');
      assert.ok(tags.includes('linting'));
    });

    it('should detect testing tags', () => {
      const tags = inferTags('test-runner', 'Runs jest tests after changes');
      assert.ok(tags.includes('testing'));
    });

    it('should detect git tags', () => {
      const tags = inferTags('commit-validator', 'Validates commit messages');
      assert.ok(tags.includes('git'));
    });

    it('should return empty for unrecognized hooks', () => {
      const tags = inferTags('xyz-unknown', 'something completely unrelated');
      assert.ok(Array.isArray(tags));
    });
  });

  describe('parseYamlFrontmatter', () => {
    it('should parse simple frontmatter', () => {
      const content = `---
name: test-hook
description: A test hook
license: MIT
---

# Content here`;
      const result = parseYamlFrontmatter(content);
      assert.strictEqual(result.name, 'test-hook');
      assert.strictEqual(result.description, 'A test hook');
      assert.strictEqual(result.license, 'MIT');
    });

    it('should return empty object for no frontmatter', () => {
      const result = parseYamlFrontmatter('# Just a heading\nSome content');
      assert.deepStrictEqual(result, {});
    });
  });
});
