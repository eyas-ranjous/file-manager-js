// retrieves file content
const readFile = fsReadFile => path =>
  new Promise((resolve, reject) => {
    fsReadFile(path, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

module.exports = readFile;
