'use strict';

/**
 * file-manager-js entry point
 */

const fs          = require('fs');
const path        = require('path'); 
const FileManager = require('./lib/fileManager');

module.exports = { create: () => new FileManager(fs, path) };