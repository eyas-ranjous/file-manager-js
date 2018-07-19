/**
 * file-manager-js/info
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

// gets an extended stats object from stats
const info = (stat, dirSize) => (path) => {
  let infoObj = {};
  return stat(path)
    .then((stats) => {
      infoObj = Object.assign({}, stats);
      if (stats.isFile()) {
        infoObj.type = 'file';
        return stats.size;
      }
      infoObj.type = 'directory';
      return dirSize(path);
    })
    .then((sz) => {
      infoObj.size = sz;
      return infoObj;
    });
};

module.exports = info;
