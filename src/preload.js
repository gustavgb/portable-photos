const { ipcRenderer } = require('electron')

window.ipcSend = function (name, arg) {
  ipcRenderer.send(name, arg)
}

window.ipcListen = function (name, listener) {
  return ipcRenderer.on(name, listener)
}
