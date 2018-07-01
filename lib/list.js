/**
 * file-manager-js/list
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const stat = require('./stat');

// lists first-level files and directories inside a directory
const list = (fsReaddir, fsStat, join) => {
  const statFn = stat(fsStat);

  return (path) => {
    const entries = { files: [], dirs: [] };
    const addEntry = p => statFn(p)
      .then((stats) => {
        if (stats.isDirectory()) {
          entries.dirs.push(p);
        } else if (stats.isFile()) {
          entries.files.push(p);
        }
      });

    return new Promise((resolve, reject) => {
      fsReaddir(path, (error, content) => {
        if (error) {
          reject(error);
        } else {
          const listing = content.map(c => addEntry(join(path, c)));
          Promise.all(listing).then(() => resolve(entries));
        }
      });
    });
  };
};

module.exports = list;
