const fs = require('fs')

const promisify = (func) => (...args) => new Promise((resolve, reject) => {
  func(...args, (err, result) => {
    if (err) {
      reject(err)
    }
    resolve(result)
  })
})

module.exports = {
  writeFile: promisify(fs.writeFile),
  rmdir: promisify(fs.rmdir),
  mkdir: promisify(fs.mkdir),
  lstat: promisify(fs.lstat),
  readFile: promisify(fs.readFile)
}
