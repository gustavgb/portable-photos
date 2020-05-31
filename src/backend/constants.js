const path = require('path')
const homedir = require('os').homedir()

const APP_DIR = path.resolve(homedir, 'dk.gbur.photos')
console.log('Using app directory: ' + APP_DIR)

const SETTINGS_FILE = path.resolve(APP_DIR, 'settings.json')

const PHOTO_REG = /^.*(?<!\.json)$/
const FILE_EXTENSION_REG = /\.\w*?$/

module.exports = {
  APP_DIR,
  SETTINGS_FILE,
  pattern: {
    PHOTO_REG,
    FILE_EXTENSION_REG
  }
}
