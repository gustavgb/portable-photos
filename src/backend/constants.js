const path = require('path')
const homedir = require('os').homedir()

const APP_DIR = path.resolve(homedir, 'dk.gbur.photos')
const SETTINGS_FILE = path.resolve(APP_DIR, 'settings.json')

console.log('Using app directory: ' + APP_DIR)

module.exports = {
  APP_DIR,
  SETTINGS_FILE
}
