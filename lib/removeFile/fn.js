/**
 * file-manager-js/removeFile
 * @copyright 2018 Eyas Ranjous <https://github.com/eyas-ranjous>
 * @license MIT
 */

module.exports = fsUnlink => path => new Promise((resolve, reject) => {
  fsUnlink(path, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve(path);
    }
  });
});
