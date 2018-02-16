# file-manager-js

[![build:?](https://travis-ci.org/eyas-ranjous/file-manager-js.svg?branch=master)](https://travis-ci.org/eyas-ranjous/file-manager-js) [![npm](https://img.shields.io/npm/dm/file-manager-js.svg)](https://www.npmjs.com/packages/file-manager-js) [![npm](https://img.shields.io/npm/v/file-manager-js.svg)](https://www.npmjs.com/package/file-manager-js) [![npm](https://img.shields.io/badge/node-%3E=%206.0-blue.svg)](https://www.npmjs.com/package/file-manager-js)

## Description 
manages files and directories on the local storage through promisified interface using node filesystem. It can list/create/remove files and directories recursively with promises.

## Install
```
npm install file-manager-js
```

## Usage 

**construction**
```
const fileManager = require('file-manager-js').create();
```

**.stat(path)**

retrieves the stats of a file or directory, a delegate to fs.stat
```
fileManager.stat('./test.txt')
.then((stats) => // https://nodejs.org/api/fs.html#fs_class_fs_stats)
.catch((error) => // error);
```

**.info(path)**

retrieves a simplified stats object with basic info
```
fileManager.info('./test.txt')
.then((info) => {
    /*
     {
         size: 19,
         lastAccess: 2018-02-16T06:22:25.000Z,
         lastModified: 2018-02-11T08:26:00.000Z,
         createTime: 2018-02-11T08:26:00.000Z
     }
    */
})
.catch((error) => error);
```

**.join(path1, path2)**

join two paths. a delegate to require('path').join 
```
let p = fileManager.join('a/b/c', 'd/e/f'); // a/b/c/d/e/f
```

**.list(path)**

list first-level files and directories inside a directory 
```
fileManager.list('./project') // it can be an absolute path using __dirname
.then((entries) => {
    /*
     {
         files: ['index.js', 'README.md'],
         dirs : ['lib', 'node_modules', 'test']
     }
    */
})
.catch((error) => // error)
```

**.listDeep(path)**

list all-levels (in-depth) files and directories inside a directory 
```
fileManager.listDeep('./content')
.then((entries) => {
    /*
     {
         files: ['test.txt', 'abc/test.csv', 'new/content/test/a.txt'],
         dirs : ['abc', 'abc/test', 'new/content/test']
     }
    */
})
.catch((error) => // error)
```

**.size(path)**

calculate files size in bytes recursively for all-levels inside a directory
```
fileManager.size('./content')
.then((size) => // size = 19003648 bytes)
.catch((error) => // error)
```

**.exists(path)**

checks if a path (file or directory) exists and resolve with true or false
```
fileManager.exists('./content')
.then((exists) => // true)
.catch((error) => // error)

fileManager.exists('./newContent')
.then((exists) => // false)
.catch((error) => // error)
```

**.createDir(path)**

creates a single directory or a directory structure recursively
```
fileManager.createDir('./a/b/c/d')
.then((path) => // path = ./a/b/c/d) // 4 nested directories created
.catch((error) => // error)
```

**.createFile(path)**

creates a file and creates the directory structure in the path if not exists
```
fileManager.createFile('./x/y/z/test.txt')
.then((path) => // path = ./x/y/z/test.txt) // 3 nested directories created and 1 file
.catch((error) => // error)
```

**.removeDir(path)**

removes a directory structure with all its content recursively
```
fileManager.removeDir('./a')
.then((path) => // path = ./a) // removed a/b/c/d + a/b/c + a/b + a/b/test.txt + a
.catch((error) => // error)
```

**.removeFile(path)**

removes a file
```
fileManager.removeFile('./test.txt')
.then((path) => // path = ./test.txt) // removed ./test.txt
.catch((error) => // error)
```

**.rename(oldPathName, newPathName)**

rename a file or directory
```
fileManager.rename('./test.txt', './ttt.txt')
.then((path) => // path = ./test.txt) // renamed ./test.txt to ./ttt.txt
.catch((error) => // error)
```

## Lint
```
grunt lint
```

## Test
```
grunt test
```

## Coverage
```
grunt coverage
```

## Build
All tasks
```
grunt build
```

## License
The MIT License. Full License is [here](https://github.com/eyas-ranjous/file-manager-js/blob/master/LICENSE)
