/**
 * file-manager-js/listDeep
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const list = require('./list');

// lists in-depth files and directories inside a directory
const listDeep = (fsReaddir, fsStat, join) => {
  const listFn = list(fsReaddir, fsStat, join);

  return (path) => {
    const entries = { files: [], dirs: [] };
    const listDeepFn = p => listFn(p)
      .then((currEntries) => {
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

module.exports = listDeep;
