const Cache = require("file-system-cache").default;
const config = require('../config');

let cache;

function initCache() {
  cache = Cache({
    basePath: config.cacheBasePath,
    ...config.cacheOptions
  });
}

function getCache() {
  if (!cache) {
    initCache();
  }
  return cache;
}

module.exports = {
  getCache
};