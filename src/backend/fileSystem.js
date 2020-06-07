/* eslint no-new: 0 */

const fs = require('fs')
const glob = require('glob')
const ExifImage = require('exif').ExifImage
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

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

const lstat = (path) => new Promise((resolve, reject) => {
  fs.lstat(path, (err, stats) => {
    if (!err) {
      resolve(stats)
    } else {
      resolve(null)
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

const createThumb = (media, thumbPath) => new Promise((resolve, reject) => {
  ffmpeg(media)
    .screenshots({
      count: 1,
      filename: path.basename(thumbPath),
      folder: path.dirname(thumbPath),
      size: '320x?'
    })
    .on('error', (err) => reject(err))
    .on('end', () => resolve())
})

module.exports = {
  writeFile: promisify(fs.writeFile),
  rmdir: promisify(fs.rmdir),
  mkdir: promisify(fs.mkdir),
  lstat,
  readFile: promisify(fs.readFile),
  unlink: promisify(fs.unlink),
  readJson,
  glob: promisify(glob),
  exists,
  readExif,
  createThumb
}
