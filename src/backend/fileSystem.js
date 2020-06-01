/* eslint no-new: 0 */

const fs = require('fs')
const glob = require('glob')
const ExifImage = require('exif').ExifImage

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

const readExif = (path) => new Promise((resolve, reject) => {
  new ExifImage({ image: path }, function (err, exifData) {
    if (err) {
      reject(err)
    }

    resolve(exifData)
  })
})

const readJson = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      reject(err)
      return
    }

    resolve(JSON.parse(data))
  })
})

module.exports = {
  writeFile: promisify(fs.writeFile),
  rmdir: promisify(fs.rmdir),
  mkdir: promisify(fs.mkdir),
  lstat: promisify(fs.lstat),
  readFile: promisify(fs.readFile),
  readJson,
  glob: promisify(glob),
  exists,
  readExif
}
