const list = require('./list');
const stat = require('./stat');

// calculates the size of all files in a dir tree
const dirSize = (fsReaddir, fsStat, join) => {
  const listFn = list(fsReaddir, fsStat, join);
  const statFn = stat(fsStat);

  return (path) => {
    let size = 0;
    const dirSizeFn = p => listFn(p)
      .then((entries) => {
        const { files } = entries;
        const { dirs } = entries;
        if (files.length > 0) {
          const sizes = files.map(f => statFn(f).then((stats) => {
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
};

module.exports = dirSize;
