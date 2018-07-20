const { readdir } = require('fs');
const { join } = require('path');
const stat = require('../stat');
const hof = require('./hof');

module.exports = hof(readdir, stat, join);
