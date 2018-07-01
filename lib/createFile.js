/**
 * file-manager-js/createFile
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const exists = require('./exists');
const createDir = require('./createDir');

// creates a file and its directory tree if not exists
const createFile = (fsOpen, fsMkdir, fsStat) => {
  const existsFn = exists(fsStat);
  const createDirFn = createDir(fsMkdir, fsStat);

  return (path) => {
    const createFileFn = p => new Promise((resolve, reject) => {
      existsFn(p)
        .then((exs) => {
          if (exs) {
            const error = new Error(`file "${p}" already exists`);
            error.code = 'EEXIST';
            reject(error);
          } else {
            fsOpen(p, 'w', (error) => {
              if (error && error.code === 'ENOENT') {
                const parts = p.split('/');
                const dirs = parts.slice(0, parts.length - 1).join('/');
                createDirFn(dirs)
                  .then(() => createFileFn(p))
                  .then(() => resolve(p));
              } else if (error) {
                reject(error);
              } else {
                resolve(p);
              }
            });
          }
        });
    });
    return createFileFn(path);
  };
};

module.exports = createFile;
