/**
 * file-manager-js
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const fs = require('fs');
const { join } = require('path');
const stat = require('./lib/stat');
const info = require('./lib/info');
const list = require('./lib/list');
const listDeep = require('./lib/listDeep');
const exists = require('./lib/exists');
const rename = require('./lib/rename');
const createDir = require('./lib/createDir');
const removeDir = require('./lib/removeDir');
const createFile = require('./lib/createFile');
const removeFile = require('./lib/removeFile');

// fileManager api
module.exports = {
  join,
  stat: stat(fs.stat),
  info: info(fs.readdir, fs.stat, join),
  list: list(fs.readdir, fs.stat, join),
  listDeep: listDeep(fs.readdir, fs.stat, join),
  exists: exists(fs.stat),
  rename: rename(fs.rename),
  createDir: createDir(fs.mkdir, fs.stat),
  removeDir: removeDir(fs.rmdir, fs.unlink, fs.readdir, fs.stat, join),
  createFile: createFile(fs.open, fs.mkdir, fs.stat),
  removeFile: removeFile(fs.unlink)
};
