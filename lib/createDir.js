/**
 * file-manager-js/createDir
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const exists = require('./exists');

// creates a directory or a directory tree
const createDir = (fsMkdir, fsStat) => {
  const existsFn = exists(fsStat);

  return (path) => {
    const dirs = path.split('/');
    let depth = 0;
    const slicePath = () => {
      depth += 1;
      return dirs.slice(0, depth).join('/');
    };
    const createDirFn = p => new Promise((resolve, reject) =>
      existsFn(p)
        .then((exs) => {
          if (exs && depth === 0) {
            const error = new Error(`directory "${p}" already exists`);
            error.code = 'EEXIST';
            reject(error);
          } else if (exs && depth > 0) {
            createDirFn(slicePath()).then(resolve);
          } else {
            fsMkdir(p, (error) => {
              if (error && error.code === 'ENOENT') {
                createDirFn(slicePath()).then(resolve);
              } else if (error) {
                reject(error);
              } else if (depth > 0 && depth < dirs.length) {
                createDirFn(slicePath()).then(resolve);
              } else {
                resolve(p);
              }
            });
          }
        }));
    return createDirFn(path);
  };
};

module.exports = createDir;
