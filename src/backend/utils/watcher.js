const watch = require('node-watch')
const { cancel } = require('./cancelledServices')
const { pattern } = require('../constants')

let watcher
let initId

exports.beginWatching = (path, id, callback) => {
  if (initId !== undefined) {
    console.log('Cancelling ' + initId)
    cancel(initId)
  }

  initId = id

  if (watcher) {
    console.log('Closing watcher')
    watcher.close()
  }

  watcher = watch(path, { recursive: true }, function (e, name) {
    console.log('File updated: ' + name)
    if (!pattern.LIBRARY_FILE_REG.test(name)) {
      callback()
    }
  })
}
