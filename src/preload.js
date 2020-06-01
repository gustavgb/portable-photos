const { ipcRenderer } = require('electron')
const fs = require('fs')

const readJson = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      reject(err)
      return
    }

    resolve(JSON.parse(data))
  })
})

window.ipcSend = function (name, arg) {
  ipcRenderer.send(name, arg)
}

window.ipcListen = function (name, listener) {
  return ipcRenderer.on(name, listener)
}

window.readLibraryData = async function (libraryDataPath) {
  let libraryData
  try {
    libraryData = await readJson(libraryDataPath)
  } catch (e) {}

  return libraryData
}
