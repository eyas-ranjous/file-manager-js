/**
 * file-manager-js/exists
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

// checks if a file or dir exists
const hof = stat => path => stat(path)
  .then(() => true)
  .catch((error) => {
    if (error.code === 'ENOENT') {
      return false;
    }
    return Promise.reject(error);
  });

module.exports = hof;
