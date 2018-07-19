/**
 * file-manager-js/rename
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

// renames a file or directory
const rename = fsRename => (oldPath, newPath) =>
  new Promise((resolve, reject) => {
    fsRename(oldPath, newPath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(newPath);
      }
    });
  });

module.exports = rename;
