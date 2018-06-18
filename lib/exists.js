const stat = require('./stat');

// checks if a file or dir exists
const exists = (fsStat) => {
  const statFn = stat(fsStat);

  return path => statFn(path)
    .then(() => true)
    .catch((error) => {
      if (error.code === 'ENOENT') {
        return false;
      }
      return Promise.reject(error);
    });
};

module.exports = exists;
