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

module.exports = removeFile;
