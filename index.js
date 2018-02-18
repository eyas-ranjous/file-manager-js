/*!
 * file-manager-js
 * Entry Point
 * Copyright(c) 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * MIT Licensed
 */

'use strict';

const fs          = require('fs');
const path        = require('path'); 
const FileManager = require('./lib/fileManager');

module.exports = { create: () => new FileManager(fs, path) };