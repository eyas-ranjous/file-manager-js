/**
 * file-manager-js/stat
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const fn = fsStat => path => new Promise((resolve, reject) => {
  fsStat(path, (error, stats) => {
    if (error) {
      reject(error);
    } else {
      resolve(stats);
    }
  });
});

module.exports = fn;
