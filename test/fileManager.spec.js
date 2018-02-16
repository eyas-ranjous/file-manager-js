'use strict';

const chai           = require('chai'),
      expect         = chai.expect,
      chaiAsPromised = require('chai-as-promised'),
      fs             = require('fs'),
      pathUtil       = require('path'),
      FileManager    = require('../lib/fileManager');

chai.use(chaiAsPromised);

describe('fileManager tests', () => {

    const STORAGE_ROOT      = __dirname + '/fixtures/storage',
          NEW_DIR           = STORAGE_ROOT + '/new',
          NEW_FILE          = NEW_DIR + '/new.txt',
          NEW_DIR_TREE      = STORAGE_ROOT + '/xxx/yyy/zzz',
          NEW_DIR_TREE_FILE = STORAGE_ROOT + '/fff/ccc/mmm/new.txt';
    
    let fileManager         = new FileManager(fs, pathUtil);

    describe('.stat(path)', () => {
        it('should get a dir stats', () => 
            expect(fileManager.stat(STORAGE_ROOT)).to.eventually.be.fulfilled
            .then((stats) => {
                expect(stats.isDirectory()).to.equal(true);
                expect(stats.size).to.equal(170);
            })
        );

        it('should get a file stats', () => 
            expect(fileManager.stat(`${STORAGE_ROOT}/t.txt`)).to.eventually.be.fulfilled
            .then(stats => {
                expect(stats.isFile()).to.equal(true);
                expect(stats.size).to.equal(19);
            })
        );

        it('should reject with an error when path not found', () => 
            expect(fileManager.stat(`${STORAGE_ROOT}/not_found.txt`)).to.eventually.be.rejected
            .to.to.have.property('code').and.to.equal('ENOENT')
        );
    });

    describe('.info(path)', () => {
        it('should get an stat info object', () => 
            expect(fileManager.info(`${STORAGE_ROOT}/t.txt`)).to.eventually.be.fulfilled
            .then(stats => {
                expect(stats.size).to.equal(19);
                expect(stats.createTime).to.be.instanceof(Date);
                expect(stats.lastAccess).to.be.instanceof(Date);
                expect(stats.lastModified).to.be.instanceof(Date);
            })
        );
    });

    describe('.list(path)', () => {
        it('should list files and dirs inside a path', () => 
            expect(fileManager.list(STORAGE_ROOT)).to.be.eventually.fulfilled
            .then(entries => {
                expect(entries.dirs.map(entry => entry.replace(STORAGE_ROOT, '')))
                .to.deep.equal([ '/a', '/b' ]);
                expect(entries.files.map(entry => entry.replace(STORAGE_ROOT, '')))
                .to.deep.equal([ '/t.txt' ]);
            })
        );
    });

    describe('.listDeep(path)', () => {
        it('should list files and dirs inside a path', () => 
            expect(fileManager.listDeep(STORAGE_ROOT)).to.be.eventually.fulfilled
            .then(entries => {
                expect(entries.dirs.map(entry => entry.replace(STORAGE_ROOT, '')))
                .to.deep.equal([ 
                    '/a', 
                    '/b',
                    '/b/c',
                    '/b/c/d'
                ]);

                expect(entries.files.map(entry => entry.replace(STORAGE_ROOT, '')))
                .to.deep.equal([ 
                    '/t.txt',
                    '/a/x.txt',
                    '/a/y.txt',
                    '/b/c/z.txt',
                    '/b/c/d/d.txt'
                ]);
            })
        );
    });

    describe('.size(path)', () => {
        it('should calculate the size of the files in a directory structure', () =>
            expect(fileManager.size(STORAGE_ROOT)).to.be.eventually.fulfilled.and.to.equal(54)
        );
    });

    describe('.exists(path)', () => {
        it('should check that a path exists and resolve', () =>
            expect(fileManager.exists(STORAGE_ROOT)).to.be.eventually.fulfilled
            .and.to.equal(true)
        );

        it('should check that a path exists and reject with a ENOENT error', () => 
            expect(fileManager.exists(STORAGE_ROOT + '/not_found')).to.be.eventually.fulfilled
            .and.to.equal(false)
        );        
    });

    describe('.createDir(path)', () => {
        it('should create a directory', () =>
            expect(fileManager.createDir(NEW_DIR)).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(NEW_DIR);
                expect(fileManager.exists(NEW_DIR)).to.eventually.be.fulfilled.and.to.equal(true);
            })
        );

        it('should create a directory tree recursively', () => 
            expect(fileManager.createDir(NEW_DIR_TREE)).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(NEW_DIR_TREE);
                expect(fileManager.exists(NEW_DIR_TREE)).to.eventually.be.fulfilled
                .and.to.equal(true);
            })
        );    
    });

    describe('.createFile(path)', () => {
        it('should create a file', () => 
            expect(fileManager.createFile(NEW_FILE)).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(NEW_FILE);
                expect(fileManager.exists(NEW_FILE)).to.eventually.be.fulfilled
                .and.to.equal(true);
            })
        );

        it('should create a file inside a directory tree', () => 
            expect(fileManager.createFile(NEW_DIR_TREE_FILE)).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(NEW_DIR_TREE_FILE);
                expect(fileManager.exists(NEW_DIR_TREE_FILE)).to.eventually.be.fulfilled
                .and.to.equal(true);
            })
        );
    });

    describe('.removeFile(path)', () => {
        it('should remove an existing file', () => 
            expect(fileManager.removeFile(NEW_FILE)).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(NEW_FILE);
                expect(fileManager.exists(NEW_FILE)).to.eventually.be.fulfilled
                .and.to.equal(false);
            })
        );
    });

    describe('.removeDir(path)', () => {
        it('should remove an existing directory', () => 
            expect(fileManager.removeDir(NEW_DIR)).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(NEW_DIR);
                expect(fileManager.exists(NEW_DIR)).to.eventually.be.fulfilled
                .and.to.equal(false);
            })
        );

        it('should remove an existing directory tree recursively', () => 
            expect(fileManager.removeDir(STORAGE_ROOT + '/xxx')).to.be.eventually.fulfilled
            .then(path => {
                expect(path).to.equal(STORAGE_ROOT + '/xxx');
                return expect(fileManager.removeDir(STORAGE_ROOT + '/fff')).to.be.eventually.fulfilled;
            })
            .then(path => {
                expect(path).to.equal(STORAGE_ROOT + '/fff');
                return expect(fileManager.exists(STORAGE_ROOT + '/xxx')).to.eventually.be.fulfilled.and.to.equal(false);
            })
            .then(() => expect(fileManager.exists(STORAGE_ROOT + '/fff')).to.eventually.be.fulfilled.and.to.equal(false))
        );
    });

    describe('.rename(oldPathName, newPathName)', () => {
        it('should rename a file', () => 
            expect(fileManager.rename(STORAGE_ROOT + '/t.txt', STORAGE_ROOT + '/r.txt'))
                .to.eventually.be.fulfilled
            .then(() => expect(fileManager.exists(STORAGE_ROOT + '/t.txt'))
                .to.eventually.be.fulfilled.and.to.equal(false))
            .then(() => expect(fileManager.exists(STORAGE_ROOT + '/r.txt'))
                .to.eventually.be.fulfilled.and.to.equal(true))
            .then(() => expect(fileManager.rename(STORAGE_ROOT + '/r.txt', STORAGE_ROOT + '/t.txt'))
                .to.eventually.be.fulfilled)
        );

        it('should rename a directory', () =>
            expect(fileManager.rename(STORAGE_ROOT + '/a', STORAGE_ROOT + '/r'))
                .to.eventually.be.fulfilled
            .then(() => expect(fileManager.exists(STORAGE_ROOT + '/a'))
                .to.eventually.be.fulfilled.and.to.equal(false))
            .then(() => expect(fileManager.exists(STORAGE_ROOT + '/r'))
                .to.eventually.be.fulfilled.and.to.equal(true))
            .then(() => expect(fileManager.rename(STORAGE_ROOT + '/r', STORAGE_ROOT + '/a'))
                .to.eventually.be.fulfilled)
        );
    });
});