/**
 * file-manager-js/removeFile
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const hof = fsUnlink => path => new Promise((resolve, reject) => {
  fsUnlink(path, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve(path);
    }
  });
});

module.exports = hof;
