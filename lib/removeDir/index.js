const { rmdir } = require('fs');
const list = require('../list');
const removeFile = require('../removeFile');
const hof = require('./hof');

module.exports = hof(rmdir, list, removeFile);
