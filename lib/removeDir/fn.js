/**
 * file-manager-js/removeDir
 * @copyright 2018 Eyas Ranjous <https://github.com/eyas-ranjous>
 * @license MIT
 */

// removes a directory with all its content recursively
module.exports = (fsRmdir, list, removeFile) => (path) => {
  const removeDir = p => new Promise((resolve, reject) => {
    fsRmdir(p, (error) => {
      if (error && error.code === 'ENOTEMPTY') {
        list(p)
          .then((entries) => {
            const filesRemoval = entries.files.map(removeFile);
            return Promise.all(filesRemoval).then(() => entries);
          })
          .then((entries) => {
            const dirsRemoval = entries.dirs.map(removeDir);
            return Promise.all(dirsRemoval);
          })
          .then(() => removeDir(p).then(resolve));
      } else if (error) {
        reject(error);
      } else {
        resolve(p);
      }
    });
  });
  return removeDir(path);
};
