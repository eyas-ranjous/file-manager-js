const stat = require('../stat');
const dirSize = require('../dirSize');
const hof = require('./hof');

module.exports = hof(stat, dirSize);
