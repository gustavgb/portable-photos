const watch = require('node-watch')
const { pattern } = require('../constants')

let watcher

exports.beginWatching = (path, callback) => {
  if (watcher) {
    console.log('Closing watcher')
    watcher.close()
  }

  watcher = watch(path, { recursive: true }, function (e, name) {
    if (!pattern.LIBRARY_FILE_REG.test(name)) {
      callback()
    }
  })
}
