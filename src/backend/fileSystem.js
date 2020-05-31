const fs = require('fs')
const glob = require('glob')

const promisify = (func) => (...args) => new Promise((resolve, reject) => {
  func(...args, (err, result) => {
    if (err) {
      reject(err)
    }
    resolve(result)
  })
})

const exists = (path) => new Promise((resolve, reject) => {
  fs.lstat(path, (err) => {
    if (!err) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
})

module.exports = {
  writeFile: promisify(fs.writeFile),
  rmdir: promisify(fs.rmdir),
  mkdir: promisify(fs.mkdir),
  lstat: promisify(fs.lstat),
  readFile: promisify(fs.readFile),
  glob: promisify(glob),
  exists
}
