/**
 * file-manager-js/stat
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const stat = fsStat => path => new Promise((resolve, reject) => {
  fsStat(path, (error, stats) => {
    if (error) {
      reject(error);
    } else {
      resolve(stats);
    }
  });
});

module.exports = stat;
