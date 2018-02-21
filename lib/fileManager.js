/**
 * file-manager-js/FileManager
 * @class
 * @copyright 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

class FileManager {

  /**
   * @constructor
   * @param {object} fs - inject node filesystem
   * @returns {object} pathUtil - inject node path utility
   */
  constructor(fs, pathUtil) {
    this.fs = fs;
    this.pathUtil = pathUtil;
  }

  /**
   * @public
   * retrieves the stats of a file or directory
   * @param {string} path
   * @returns {Promise} - resolves with fs stats object
   */
  stat(path) {
    return new Promise((resolve, reject) => {
      this.fs.stat(path, (error, stats) => {
        if (error) {
          reject(error);
        }
        else {
          resolve(stats);
        }
      });
    });
  }

  /**
   * @public
   * gets a simplified stats object from the full stats
   * @param {string} path
   * @returns {Promise}
   */
  info(path) {
    return this.stat(path).then((stats) => {
      return {
        size: stats.size,
        lastAccess: stats.atime,
        lastModified: stats.mtime,
        createTime: stats.ctime
      };
    }); 
  }

  /**
   * @public
   * require('path').join delegate
   * @param {string} path
   * @param {string} path
   * @returns {string}
   */
  join(p1, p2) {
    return this.pathUtil.join(p1, p2);
  }

  /**
   * @public
   * lists first-level files and directories inside a directory
   * @param {string} path
   * @returns {Promise} - resolve {files: [], dirs: []} / reject fs.readdir errors
   */
  list(path) {
    return new Promise((resolve, reject) => {
      let entries = { files: [], dirs: [] };
      this.fs.readdir(path, (error, content) => {
        if (error) {
          reject(error);
        }
        else {
          let listing = content.map((c) => {
            return this._addEntry(this.join(path, c), entries);
          });
          return Promise.all(listing).then(() => resolve(entries));
        }
      });
    });
  }

  /**
   * @public
   * lists recursively in-depth files and directories inside a directory
   * @param {string} path
   * @param {object} entries - memoize files and dirs
   * @returns {Promise} - resolve {files: [], dirs: []} / reject fs.readdir errors
   */
  listDeep(path, entries = { files: [], dirs: [] }) {
    return this.list(path).then(currentEntries => {
      if (currentEntries.files.length > 0) {
        entries.files = entries.files.concat(currentEntries.files);
      }
      if (currentEntries.dirs.length > 0) {
        entries.dirs = entries.dirs.concat(currentEntries.dirs);
        let deepListing = currentEntries.dirs.map((d) => {
          return this.listDeep(d, entries);
        });
        return Promise.all(deepListing).then(() => entries);
      }
      else {
          return entries;
      }
    });
  }

  /**
   * @public
   * calculates recursively the size of in-depth files inside a directory
   * @param {string} path
   * @param {array} [sizes=[]] - memoize sizes
   * @returns {Promise} - resolve with size as bytes
   */
  size(path, sizes = []) {
    return this.list(path).then((entries) => {
      if (entries.files.length > 0) {
        let sizeAddition = entries.files.map((f) => {
          return this.info(f).then((info) => sizes.push(info.size));
        });
        return Promise.all(sizeAddition).then(() => entries);
      }
      else {
        return entries;
      }
    })
    .then((entries) => {
      if (entries.dirs.length > 0) {
        let deepSizes = entries.dirs.map((d) => this.size(d, sizes));
        return Promise.all(deepSizes).then(sizes => sizes);
      }
      else {
        return sizes;
      }
    })
    .then(() => {
      return sizes.reduce((a, b) => a + b);
    });
  }

  /**
   * @public
   * checks if a file or dir exists
   * @param {string} path
   * @returns {Promise} - resolve with true|false / reject with fs errors
   */
  exists(path) {
    return this.stat(path).then(() => {
      return true;
    })
    .catch((error) => {
      if (error.code === 'ENOENT') {
        return false;
      }
      else {
        return Promise.reject(error);
      }
    });
  }

  /**
   * @public
   * creates a aiderctory or directory structure recursively
   * @param {string} path
   * @param {array} dirs - memoizes the directories of the path
   * @param {number} depth - memoizes current depth
   * @returns {Promise} - resolve with created path
   */
  createDir(path, dirs = path.split('/'), depth = 0) {
    return new Promise((resolve, reject) => {
      this.exists(path).then((exists) => {
        if (exists && depth === 0) {
            reject(new Error(`directory "${path}" already exists`));
        }
        else if (exists && depth > 0) {
          return this._createDirAtDepth(dirs, depth, resolve);
        }
        else if (!exists) {
          this.fs.mkdir(path, (error) => {
            if (error && error.code === 'ENOENT') {
              return this._createDirAtDepth(dirs, depth, resolve);
            }
            else if (error) {
              reject(error);
            }
            else if (depth > 0 && depth < dirs.length) {
              return this._createDirAtDepth(dirs, depth, resolve);
            }
            else if (depth === 0 || depth === dirs.length) {
              resolve(path);
            }
          });
        }
      });
    });
  }

  /**
   * @public
   * creates a file and the directory structure that contains it
   * @param {string} path
   * @returns {Promise} - resolve with created path
   */
  createFile(path) {
    return new Promise((resolve, reject) => {
      this.exists(path).then((exists) => {
        if (exists) {
          reject(new Error(`file "${path}" already exists`));
        }
        else {
          this.fs.open(path, 'w', (error) => {
            if (error && error.code === 'ENOENT') {
              let parts = path.split('/');
              let dirs = parts.slice(0, parts.length - 1).join('/');
              this.createDir(dirs).then(() => {
                return this.createFile(path);
              })
              .then(() => resolve(path));
            }
            else if (error) {
              reject(error);
            }
            else {
              resolve(path);
            }
          });
        }
      });
    });
  }

  /**
   * @public
   * removes a file
   * @param {string} path
   * @returns {Promise} - resolve with removed path
   */
  removeFile(path) {
    return new Promise((resolve, reject) => {
      this.fs.unlink(path, (error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve(path);
        }
      });
    });
  }

  /**
   * @public
   * removes a directory or a directory structure recursively
   * @param {string} path
   * @returns {Promise} - resolve with removed path
   */
  removeDir(path) {
    return new Promise((resolve, reject) => {
      this.fs.rmdir(path, (error) => {
        if (error && error.code === 'ENOTEMPTY') {
          this.list(path).then((entries) => {
            let filesRemoval = entries.files.map((f) => this.removeFile(f));
            return Promise.all(filesRemoval).then(() => entries);
          })
          .then(entries => {
            let dirsRemoval = entries.dirs.map((d) => this.removeDir(d));
            return Promise.all(dirsRemoval);
          })
          .then(() => {
            return this.removeDir(path).then((path) => resolve(path));
          });
        }
        else if (error) {
          reject(error);
        }
        else {
          resolve(path);
        }
      });
    });
  }

  /**
   * @public
   * renames a file or directory
   * @param {string} old path name
   * @param {string} new path name
   * @returns {Promise} - resolve with true
   */
  rename(oldPathName, newNamePath) {
    return new Promise((resolve, reject) => {
      this.fs.rename(oldPathName, newNamePath, error => {
        if (error) {
          reject(error);
        }
        else {
          resolve(true);
        }
      });
    });
  }

  /**
   * @private
   */
  _addEntry(path, entries) {
    return this.stat(path).then((stats) => {
      if (stats.isDirectory()) {
        entries.dirs.push(path);
      }
      else if (stats.isFile()) {
        entries.files.push(path);
      }
    });
  }


  /**
   * @private
   */
  _createDirAtDepth(dirs, depth, resolve) {
    let path = dirs.slice(0, ++depth).join('/');
    return this.createDir(path, dirs, depth).then(pth => resolve(pth));
  }
}

module.exports = FileManager;