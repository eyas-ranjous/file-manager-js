/**
 * file-manager-js/readFile
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

// retrieves file content
const readFile = fsReadFile => path =>
  new Promise((resolve, reject) => {
    fsReadFile(path, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

module.exports = readFile;
