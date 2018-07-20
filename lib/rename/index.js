const { rename } = require('fs');
const hof = require('./hof');

module.exports = hof(rename);
