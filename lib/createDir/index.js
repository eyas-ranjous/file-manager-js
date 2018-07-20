const { mkdir } = require('fs');
const exists = require('../exists');
const hof = require('./hof');

module.exports = hof(mkdir, exists);
