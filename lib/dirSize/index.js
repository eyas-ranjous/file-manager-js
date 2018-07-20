const list = require('../list');
const stat = require('../stat');
const hof = require('./hof');

module.exports = hof(list, stat);
