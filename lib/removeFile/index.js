const { unlink } = require('fs');
const hof = require('./hof');

module.exports = hof(unlink);
