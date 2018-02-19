'use strict';

const chai           = require('chai');
const expect         = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const fs             = require('fs');
const pathUtil       = require('path');
const FileManager    = require('../lib/fileManager');

chai.use(chaiAsPromised);

describe('fileManager tests', () => {

  const STORAGE_ROOT  = __dirname + '/fixtures/storage',
    NEW_DIR           = STORAGE_ROOT + '/new',
    NEW_FILE          = NEW_DIR + '/new.txt',
    NEW_DIR_TREE      = STORAGE_ROOT + '/xxx/yyy/zzz',
    NEW_DIR_TREE_FILE = STORAGE_ROOT + '/fff/ccc/mmm/new.txt';
  
  let fileManager     = new FileManager(fs, pathUtil);

  describe('.stat(path)', () => {
    it('should get a dir stats', () => {
      return expect(fileManager.stat(STORAGE_ROOT)).to
        .be.eventually.fulfilled.then((stats) => {
          expect(stats.isDirectory()).to.equal(true);
          expect(stats.size).to.be.above(0);
        });
    }); 

    it('should get a file stats', () => {
      return expect(fileManager.stat(`${STORAGE_ROOT}/t.txt`)).to
        .be.eventually.fulfilled.then((stats) => {
          expect(stats.isFile()).to.equal(true);
          expect(stats.size).to.equal(19);
        });
    });

    it('should reject with an error when path not found', () => {
      return expect(fileManager.stat(`${STORAGE_ROOT}/not_found.txt`)).to
        .be.eventually.rejected.and.to
        .have.property('code').and.to.equal('ENOENT');
    });
  });

  describe('.info(path)', () => {
    it('should get an stat info object', () => {
      return expect(fileManager.info(`${STORAGE_ROOT}/t.txt`)).to
        .be.eventually.fulfilled.then((stats) => {
          expect(stats.size).to.equal(19);
          expect(stats.createTime).to.be.instanceof(Date);
          expect(stats.lastAccess).to.be.instanceof(Date);
          expect(stats.lastModified).to.be.instanceof(Date);
        });
    });
  });

  describe('.list(path)', () => {
    it('should list files and dirs inside a path', () => {
      return expect(fileManager.list(STORAGE_ROOT)).to
        .be.eventually.fulfilled.then((entries) => {
          expect(entries.dirs.map((entry) => entry.replace(STORAGE_ROOT, '')))
            .to.deep.equal([ '/a', '/b' ]);
          expect(entries.files.map((entry) => entry.replace(STORAGE_ROOT, '')))
            .to.deep.equal([ '/t.txt' ]);
        });
    });
  });

  describe('.listDeep(path)', () => {
    it('should list files and dirs inside a path', () => {
      return expect(fileManager.listDeep(STORAGE_ROOT)).to
        .be.eventually.fulfilled.then((entries) => {
          let dirs = entries.dirs.map((entry) => { 
            return entry.replace(STORAGE_ROOT, '');
          });
          expect(dirs).to.deep.equal(['/a', '/b', '/b/c', '/b/c/d']);
          let files = entries.files.map((entry) => {
            return entry.replace(STORAGE_ROOT, '');
          });
          expect(files).to.have.members([ 
            '/t.txt',
            '/a/x.txt',
            '/a/y.txt',
            '/b/c/z.txt',
            '/b/c/d/d.txt'
          ]);
      });
    });
  });

  describe('.size(path)', () => {
    it('should calculate the size of files in a directory structure', () => {
        return expect(fileManager.size(STORAGE_ROOT)).to
          .be.eventually.fulfilled.and.to.equal(54);
    });
  });

  describe('.exists(path)', () => {
    it('should check that a path exists and resolve with true', () => {
        return expect(fileManager.exists(STORAGE_ROOT)).to
          .be.eventually.fulfilled.and.to.equal(true);
    });

    it('should check that a path exists resolve with false', () => {
        return expect(fileManager.exists(STORAGE_ROOT + '/not_found')).to
          .be.eventually.fulfilled.and.to.equal(false);
    });
  });

  describe('.createDir(path)', () => {
    it('should create a directory', () => {
      return expect(fileManager.createDir(NEW_DIR)).to
        .be.eventually.fulfilled.then((path) => {
          expect(path).to.equal(NEW_DIR);
          expect(fileManager.exists(NEW_DIR)).to
            .eventually.be.fulfilled.and.to.equal(true);
        });
    });

    it('should create a directory tree recursively', () => {
      return expect(fileManager.createDir(NEW_DIR_TREE)).to
        .be.eventually.fulfilled.then((path) => {
            expect(path).to.equal(NEW_DIR_TREE);
            expect(fileManager.exists(NEW_DIR_TREE)).to
              .eventually.be.fulfilled.and.to.equal(true);
        });
    }); 
  });

  describe('.createFile(path)', () => {
    it('should create a file', () => {
      return expect(fileManager.createFile(NEW_FILE)).to
        .be.eventually.fulfilled.then((path) => {
          expect(path).to.equal(NEW_FILE);
          expect(fileManager.exists(NEW_FILE)).to
            .be.eventually.fulfilled.and.to.equal(true);
        });
    });

    it('should create a file inside a directory tree', () => {
      return expect(fileManager.createFile(NEW_DIR_TREE_FILE)).to
        .be.eventually.fulfilled.then((path) => {
          expect(path).to.equal(NEW_DIR_TREE_FILE);
          expect(fileManager.exists(NEW_DIR_TREE_FILE)).to
            .eventually.be.fulfilled.and.to.equal(true);
        });
    });
  });

  describe('.removeFile(path)', () => {
    it('should remove an existing file', () => {
      return expect(fileManager.removeFile(NEW_FILE)).to
        .be.eventually.fulfilled.then((path) => {
          expect(path).to.equal(NEW_FILE);
          expect(fileManager.exists(NEW_FILE)).to
            .eventually.be.fulfilled.and.to.equal(false);
        });
    });
  });

  describe('.removeDir(path)', () => {
    it('should remove an existing directory', () => {
      return expect(fileManager.removeDir(NEW_DIR)).to
        .be.eventually.fulfilled.then((path) => {
          expect(path).to.equal(NEW_DIR);
          expect(fileManager.exists(NEW_DIR)).to
            .be.eventually.fulfilled.and.to.equal(false);
        });
    });

    it('should remove an existing directory tree recursively', () => {
      return expect(fileManager.removeDir(STORAGE_ROOT + '/xxx')).to
        .be.eventually.fulfilled.then((path) => {
          expect(path).to.equal(STORAGE_ROOT + '/xxx');
          return expect(fileManager.removeDir(STORAGE_ROOT + '/fff')).to
            .be.eventually.fulfilled;
        })
        .then((path) => {
            expect(path).to.equal(STORAGE_ROOT + '/fff');
            return expect(fileManager.exists(STORAGE_ROOT + '/xxx')).to
              .be.eventually.fulfilled.and.to.equal(false);
        })
        .then(() => {
          expect(fileManager.exists(STORAGE_ROOT + '/fff')).to
            .be.eventually.fulfilled.and.to.equal(false);
        });
    });
  });

  describe('.rename(oldPathName, newPathName)', () => {
    it('should rename a file', () => {
      let newPathName = STORAGE_ROOT + '/r.txt';
      let oldPathName = STORAGE_ROOT + '/t.txt';
      return expect(fileManager.rename(oldPathName, newPathName)).to
        .be.eventually.fulfilled.then(() => {
          return expect(fileManager.exists(oldPathName)).to
            .be.eventually.fulfilled.and.to.equal(false);
        })
        .then(() => {
          return expect(fileManager.exists(newPathName)).to
            .be.eventually.fulfilled.and.to.equal(true);
        })
        .then(() => {
          expect(fileManager.rename(newPathName, oldPathName)).to
            .be.eventually.be.fulfilled.and.to.equal(true);
        });
    });

    it('should rename a directory', () => {
      let newPathName = STORAGE_ROOT + '/r';
      let oldPathName = STORAGE_ROOT + '/a';
      return expect(fileManager.rename(oldPathName, newPathName)).to
        .be.eventually.be.fulfilled.then(() => {
          return expect(fileManager.exists(oldPathName)).to
            .be.eventually.fulfilled.and.to.equal(false);
        })
        .then(() => {
          return expect(fileManager.exists(newPathName)).to
            .be.eventually.fulfilled.and.to.equal(true);
        })
        .then(() => {
          return expect(fileManager.rename(newPathName, oldPathName))
            .to.eventually.be.fulfilled;
        });
    });
  });

});