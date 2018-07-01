/**
 * file-manager-js/info
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const stat = require('./stat');
const dirSize = require('./dirSize');

// gets an extended stats object from stats
const info = (fsReaddir, fsStat, join) => {
  const statFn = stat(fsStat);
  const dirSizeFn = dirSize(fsReaddir, fsStat, join);

  return (path) => {
    let infoObj = {};
    return statFn(path)
      .then((stats) => {
        infoObj = Object.assign({}, stats);
        if (stats.isFile()) {
          infoObj.type = 'file';
          return stats.size;
        }
        infoObj.type = 'directory';
        return dirSizeFn(path);
      })
      .then((sz) => {
        infoObj.size = sz;
        return infoObj;
      });
  };
};

module.exports = info;
