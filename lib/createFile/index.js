const { open } = require('fs');
const createDir = require('../createDir');
const exists = require('../exists');
const hof = require('./hof');

module.exports = hof(open, createDir, exists);
