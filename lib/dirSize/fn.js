/**
 * file-manager-js/dirSize
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

// calculates the size of all files in a dir tree
const dirSize = (list, stat) => (path) => {
  let size = 0;
  const dirSizeFn = p => list(p)
    .then((entries) => {
      const { files } = entries;
      const { dirs } = entries;
      if (files.length > 0) {
        const sizes = files.map(f => stat(f).then((stats) => {
          size += stats.size;
        }));
        return Promise.all(sizes).then(() => dirs);
      }
      return dirs;
    })
    .then((dirs) => {
      if (dirs.length > 0) {
        const sizes = dirs.map(dirSizeFn);
        return Promise.all(sizes).then(() => size);
      }
      return size;
    });
  return dirSizeFn(path);
};

module.exports = dirSize;
