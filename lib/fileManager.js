'use strict';

/*!
 * FileManager
 * Copyright(c) 2018 Eyas Ranjous <eyas.ranjous@gmail.com>
 * MIT Licensed
 */

class FileManager {

    /**
     * @public
     * @param {object} fs - require('fs')
     * @returns {object} pathUtil - require('path')
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
     * builds a simplified stats object from the full stats
     * @param {string} path
     * @returns {Promise}
     */
    info(path) {
        return this.stat(path)
        .then((stats) => {
            return Promise.resolve({
                size: stats.size,
                lastAccess: stats.atime,
                lastModified: stats.mtime,
                createTime: stats.ctime
            });
        }); 
    }

    /**
     * @private
     */
    addEntry(path, entries) {
        return this.stat(path)
        .then((stats) => {
            if (stats.isDirectory()) {
                entries.dirs.push(path);
            }
            else if (stats.isFile()) {
                entries.files.push(path);
            }
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
     * @return {Promise} - resolve {files: [], dirs: []} / reject fs.readdir errors
     */
    list(path) {
        return new Promise((resolve, reject) => {
            let entries = { files: [], dirs: [] };
            this.fs.readdir(path, (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    Promise.all(data.map(c => this.addEntry(this.join(path, c), entries)))
                    .then(() => resolve(entries));
                }
            });
        });
    }

    /**
     * @public
     * lists recursively in-depth files and directories inside a directory
     * @param {string} path
     * @param {object} entries - memoize files and dirs
     * @return {Promise} - resolve {files: [], dirs: []} / reject fs.readdir errors
     */
    listDeep(path, entries = { files: [], dirs: [] }) {
        return this.list(path)
        .then((dEntries) => {
            if (dEntries.files.length > 0) {
                entries.files = entries.files.concat(dEntries.files);
            }
            if (dEntries.dirs.length > 0) {
                entries.dirs = entries.dirs.concat(dEntries.dirs);
                return Promise.all(dEntries.dirs.map(d => this.listDeep(d, entries)))
                       .then(() => entries);
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
     * @param {array} sizes - memoize sizes
     * @return {Promise} - resolve with size as bytes
     */
    size(path, sizes = []) {
        return this.list(path)
        .then((entries) => {
            if (entries.files.length > 0) {
                let infos = entries.files.map(f => this.info(f).then(info => sizes.push(info.size)));
                return Promise.all(infos).then(() => entries);
            }
            else {
                return Promise.resolve(entries);
            }
        })
        .then((entries) => {
            if (entries.dirs.length > 0) {
                return Promise.all(entries.dirs.map(d => this.size(d, sizes))).then(() => sizes);
            }
            else {
                return sizes;
            }
        })
        .then(() => sizes.reduce((a, b) => a + b));
    }

    /**
     * @public
     * checks if a file or dir exists
     * @param {string} path
     * @return {Promise} - resolve with true or false / reject with other fs errors
     */
    exists(path) {
        return this.stat(path)
            .then(() => Promise.resolve(true))
            .catch((error) => {
                if (error.code === 'ENOENT') {
                    return Promise.resolve(false);
                }
                else {
                    return Promise.reject(error);
                }
            });
    }

    /**
     * @private
     */
    createDirAtDepth(dirs, depth, resolve) {
        let path = dirs.slice(0, ++depth).join('/');
        return this.createDir(path, dirs, depth).then(pth => resolve(pth));
    }

    /**
     * @public
     * creates a aiderctory or directory structure recursively
     * @param {string} path
     * @param {array} dirs - memoizes the directories of the path
     * @param {number} depth - memoizes current depth
     * @return {Promise}
     */
    createDir(path, dirs = path.split('/'), depth = 0) {
        return new Promise((resolve, reject) => {
            this.exists(path)
            .then(exists => {
                if (exists && depth === 0) {
                    reject(new Error(`directory "${path}" already exists`));
                }
                else if (exists && depth > 0) {
                    return this.createDirAtDepth(dirs, depth, resolve);
                }
                else if (!exists) {
                    this.fs.mkdir(path, (error) => {
                        if (error && error.code === 'ENOENT') {
                            return this.createDirAtDepth(dirs, depth, resolve);
                        }
                        else if (error) {
                            reject(error);
                        }
                        else if (depth > 0 && depth < dirs.length) {
                            return this.createDirAtDepth(dirs, depth, resolve);
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
     * @return {Promise}
     */
    createFile(path) {
        return new Promise((resolve, reject) => {
            this.exists(path)
            .then(exists => {
                if (exists) {
                    reject(new Error(`file "${path}" already exists`));
                }
                else {
                    this.fs.open(path, 'w', (error) => {
                        if (error && error.code === 'ENOENT') {
                            let parts = path.split('/');
                            let dirs = parts.slice(0, parts.length - 1).join('/');
                            return this.createDir(dirs)
                                .then(() => this.createFile(path))
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
     * @return {Promise}
     */
    removeFile(path) {
        return new Promise((resolve, reject) => {
            this.fs.unlink(path, error => {
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
     * @return {Promise}
     */
    removeDir(path) {
        return new Promise((resolve, reject) => {
            this.fs.rmdir(path, error => {
                if (error && error.code === 'ENOTEMPTY') {
                    return this.list(path)
                    .then(entries => {
                        return Promise.all(entries.files.map(file => this.removeFile(file)))
                            .then(() => entries);
                    })
                    .then(entries => {
                        return Promise.all(entries.dirs.map(dir => this.removeDir(dir)));
                    })
                    .then(() => {
                        return this.removeDir(path).then(pth => resolve(pth));
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
     * @return {Promise}
     */
    rename(oldPathName, newNamePath) {
        return new Promise((resolve, reject) => {
            this.fs.rename(oldPathName, newNamePath, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
}

module.exports = FileManager;