'use strict';

const { findHook, searchHooks, filterHooks, getAllHooks, getAllTags } = require('./registry');
const { installHook, fetchHookContent } = require('./installer');

module.exports = {
  findHook,
  searchHooks,
  filterHooks,
  getAllHooks,
  getAllTags,
  installHook,
  fetchHookContent,
};
