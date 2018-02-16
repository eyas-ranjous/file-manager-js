'use strict';

const fs          = require('fs'),
      path        = require('path'), 
      FileManager = require('./lib/fileManager');

module.exports = { create: () => new FileManager(fs, path) };