/**
 * file-manager-js
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const stat = fsStat => path => new Promise((resolve, reject) => {
  fsStat(path, (error, stats) => {
    if (error) {
      reject(error);
    } else {
      resolve(stats);
    }
  });
});

// lists first-level files and directories inside a directory
const list = (fsReaddir, fsStat, join) => {
  const statFn = stat(fsStat);

  return (path) => {
    const entries = { files: [], dirs: [] };
    const addEntry = p => statFn(p).then((stats) => {
      if (stats.isDirectory()) {
        entries.dirs.push(p);
      } else if (stats.isFile()) {
        entries.files.push(p);
      }
    });
    return new Promise((resolve, reject) => {
      fsReaddir(path, (error, content) => {
        if (error) {
          return reject(error);
        }
        const listing = content.map(c => addEntry(join(path, c)));
        return Promise.all(listing).then(() => resolve(entries));
      });
    });
  };
};

// lists in-depth files and directories inside a directory
const listDeep = (fsReaddir, fsStat, join) => {
  const listFn = list(fsReaddir, fsStat, join);

  return (path) => {
    const entries = { files: [], dirs: [] };
    const listDeepFn = p => listFn(p).then((currEntries) => {
      if (currEntries.files.length > 0) {
        entries.files = entries.files.concat(currEntries.files);
      }
      if (currEntries.dirs.length > 0) {
        entries.dirs = entries.dirs.concat(currEntries.dirs);
        const listing = currEntries.dirs.map(listDeepFn);
        return Promise.all(listing).then(() => entries);
      }
      return entries;
    });
    return listDeepFn(path);
  };
};

// calculates the size of all files in a dir tree
const dirSize = (fsReaddir, fsStat, join) => {
  const listFn = list(fsReaddir, fsStat, join);
  const statFn = stat(fsStat);

  return (path) => {
    let size = 0;
    const dirSizeFn = p => listFn(p).then((entries) => {
      const { files } = entries;
      const { dirs } = entries;
      if (files.length > 0) {
        const sizes = files.map(f => statFn(f).then((stats) => {
          size += stats.size;
        }));
        return Promise.all(sizes).then(() => dirs);
      }
      return dirs;
    }).then((dirs) => {
      if (dirs.length > 0) {
        const sizes = dirs.map(dirSizeFn);
        return Promise.all(sizes).then(() => size);
      }
      return size;
    });
    return dirSizeFn(path);
  };
};

// gets a simplified stats object from the full stats
const info = (fsReaddir, fsStat, join) => {
  const dirSizeFn = dirSize(fsReaddir, fsStat, join);
  const statFn = stat(fsStat);

  return (path) => {
    let infoObj = {};
    return statFn(path).then((stats) => {
      infoObj = Object.assign({}, stats);
      if (stats.isFile()) {
        infoObj.type = 'file';
        return stats.size;
      }
      infoObj.type = 'directory';
      return dirSizeFn(path);
    }).then((sz) => {
      infoObj.size = sz;
      return infoObj;
    });
  };
};

// checks if a file or dir exists
const exists = (fsStat) => {
  const statFn = stat(fsStat);
  return path => statFn(path).then(() => true)
    .catch(error => (error.code === 'ENOENT' ? false : Promise.reject(error)));
};

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
      existsFn(p).then((exs) => {
        if (exs && depth === 0) {
          const error = new Error(`directory "${p}" already exists`);
          error.code = 'EEXIST';
          return reject(error);
        } else if (exs && depth > 0) {
          return createDirFn(slicePath()).then(resolve);
        }
        return fsMkdir(p, (error) => {
          if (error && error.code === 'ENOENT') {
            return createDirFn(slicePath()).then(resolve);
          } else if (error) {
            return reject(error);
          } else if (depth > 0 && depth < dirs.length) {
            return createDirFn(slicePath()).then(resolve);
          }
          return resolve(p);
        });
      }));
    return createDirFn(path);
  };
};

// creates a file and its directory tree if not exists
const createFile = (fsOpen, fsMkdir, fsStat) => {
  const existsFn = exists(fsStat);
  const createDirFn = createDir(fsMkdir, fsStat);
  return (path) => {
    const createFileFn = p => new Promise((resolve, reject) => {
      existsFn(p).then((exs) => {
        if (exs) {
          const error = new Error(`file "${p}" already exists`);
          error.code = 'EEXIST';
          reject(error);
        } else {
          fsOpen(p, 'w', (error) => {
            if (error && error.code === 'ENOENT') {
              const parts = p.split('/');
              const dirs = parts.slice(0, parts.length - 1).join('/');
              createDirFn(dirs).then(() => createFileFn(p))
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

// removes a file
const removeFile = fsUnlink => path => new Promise((resolve, reject) => {
  fsUnlink(path, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve(path);
    }
  });
});

// removes a directory with all its content recursively
const removeDir = (fsRmdir, fsUnlink, fsReaddir, fsStat, join) => {
  const listFn = list(fsReaddir, fsStat, join);
  const removeFileFn = removeFile(fsUnlink);
  return (path) => {
    const removeDirFn = p => new Promise((resolve, reject) => {
      fsRmdir(p, (error) => {
        if (error && error.code === 'ENOTEMPTY') {
          listFn(p).then((entries) => {
            const filesRemoval = entries.files.map(removeFileFn);
            return Promise.all(filesRemoval).then(() => entries);
          }).then((entries) => {
            const dirsRemoval = entries.dirs.map(removeDirFn);
            return Promise.all(dirsRemoval);
          }).then(() => removeDirFn(p).then(resolve));
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

// renames a file or directory
const rename = fsRename => (oldPath, newPath) =>
  new Promise((resolve, reject) => {
    fsRename(oldPath, newPath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });

// fileManager api
module.exports = (fs, path) => ({
  join: path.join.bind(path),
  stat: stat(fs.stat),
  dirSize: dirSize(fs.readdir, fs.stat, path.join),
  info: info(fs.readdir, fs.stat, path.join),
  list: list(fs.readdir, fs.stat, path.join),
  listDeep: listDeep(fs.readdir, fs.stat, path.join),
  exists: exists(fs.stat),
  rename: rename(fs.rename),
  createDir: createDir(fs.mkdir, fs.stat),
  removeDir: removeDir(fs.rmdir, fs.unlink, fs.readdir, fs.stat, path.join),
  createFile: createFile(fs.open, fs.mkdir, fs.stat),
  removeFile: removeFile(fs.unlink)
});
