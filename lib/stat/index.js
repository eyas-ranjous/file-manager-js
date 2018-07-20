const { stat } = require('fs');
const hof = require('./hof');

module.exports = hof(stat);
