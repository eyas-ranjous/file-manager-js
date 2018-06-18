const list = require('./list');
const removeFile = require('./removeFile');

// removes a directory with all its content recursively
const removeDir = (fsRmdir, fsUnlink, fsReaddir, fsStat, join) => {
  const listFn = list(fsReaddir, fsStat, join);
  const removeFileFn = removeFile(fsUnlink);
  return (path) => {
    const removeDirFn = p => new Promise((resolve, reject) => {
      fsRmdir(p, (error) => {
        if (error && error.code === 'ENOTEMPTY') {
          listFn(p)
            .then((entries) => {
              const filesRemoval = entries.files.map(removeFileFn);
              return Promise.all(filesRemoval).then(() => entries);
            })
            .then((entries) => {
              const dirsRemoval = entries.dirs.map(removeDirFn);
              return Promise.all(dirsRemoval);
            })
            .then(() => removeDirFn(p).then(resolve));
        } else if (error) {
          reject(error);
        } else {
          resolve(p);
        }
      });
    });
    return removeDirFn(path);
  };
};

module.exports = removeDir;
