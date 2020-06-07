const path = require('path')
const homedir = require('os').homedir()

const APP_DIR = path.resolve(homedir, 'dk.gbur.photos')
console.log('Using app directory: ' + APP_DIR)

const SETTINGS_FILE = path.resolve(APP_DIR, 'settings.json')

const MEDIA_REG = /^.*(?<!\.json)$/i
const FILE_EXTENSION_REG = /\.\w*?$/i
const JPG_EXTENSION_REG = /\.(jpg|jpeg)$/i
const LIBRARY_FILE_REG = /^.*library.*$/

const PHOTO_REG = /^.*\.(png|jpe?g|gif|svg|bmp)/i
const VIDEO_REG = /^.*\.(webm|avi|mov|wmv|mp4)/i

module.exports = {
  APP_DIR,
  SETTINGS_FILE,
  pattern: {
    MEDIA_REG,
    FILE_EXTENSION_REG,
    JPG_EXTENSION_REG,
    LIBRARY_FILE_REG,
    VIDEO_REG,
    PHOTO_REG
  }
}
