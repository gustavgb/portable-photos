const { ipcMain } = require('electron')
const fs = require('./fileSystem')
const { SETTINGS_FILE } = require('./constants')
const path = require('path')
const { createAlbum, updateAlbum, deleteAlbum } = require('./utils/albums')
const { cancel } = require('./utils/cancelledServices')
const { initialize } = require('./utils/initialize')

ipcMain.on('request-app-settings', async (event) => {
  console.log('Received settings request')

  try {
    const settings = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'))

    console.log('Read settings:', settings)

    event.reply('send-app-settings', settings)
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('request-library-data', async (event) => {
  console.log('Received library data request')

  try {
    const settings = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'))
    const libraryDataPath = path.resolve(settings.libraryFolder, 'libraryData.json')

    event.reply('send-library-data', libraryDataPath)
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('request-library-init', async () => {
  try {
    await initialize()
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('request-service-cancel', (event, arg) => {
  console.log('Recieved cancel request for service: ' + arg)

  try {
    cancel(arg)
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('request-new-album', async (event, arg) => {
  console.log('Recieved new album request')
  console.log(arg)

  try {
    await createAlbum(arg)
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('request-update-album', async (event, arg) => {
  console.log('Recieved update album request')
  console.log(arg)

  try {
    await updateAlbum(arg)
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('request-delete-album', async (event, arg) => {
  console.log('Recieved delete album request')
  console.log(arg)

  try {
    await deleteAlbum(arg)
  } catch (e) {
    console.log(e)
  }
})
