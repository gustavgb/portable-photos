const { getMainWindow } = require('../mainWindowState')
const fs = require('../fileSystem')
const { pattern } = require('../constants')

exports.createIpcSender = () => {
  let focusedWindow = getMainWindow()

  return (name, arg) => {
    if (!focusedWindow) {
      focusedWindow = getMainWindow()
    }

    if (focusedWindow) {
      focusedWindow.webContents.send(name, arg)
    }
  }
}

exports.promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([]))

exports.getMediaFiles = async (settings) => {
  const files = await fs.glob(`${settings.library}/**/*`)
  const media = files.filter(file =>
    !pattern.LIBRARY_FILE_REG.test(file) &&
    pattern.FILE_EXTENSION_REG.test(file) &&
    pattern.MEDIA_REG.test(file)
  )

  return media
}
