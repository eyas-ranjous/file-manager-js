const fs = require('fs');
const path = require('path');
const fileManager = require('./lib/fileManager');

module.exports = fileManager(fs, path);
