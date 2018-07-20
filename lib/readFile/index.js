const { readFile } = require('fs');
const hof = require('./hof');

module.exports = hof(readFile);
