const { ipcMain } = require('electron')
const fs = require('./fileSystem')
const { SETTINGS_FILE } = require('./constants')
const path = require('path')
const { initialize, cancelInit } = require('./utils')

ipcMain.on('request-app-settings', async (event) => {
  console.log('Received settings request')

  try {
    const settings = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'))

    console.log('Read settings:', settings)

    event.reply('send-app-settings', settings)
    event.returnValue = settings
  } catch (e) {
    console.log(e)
    event.returnValue = e
  }
})

ipcMain.on('request-library-data', async (event) => {
  console.log('Received library data request')

  try {
    const settings = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'))
    const libraryDataPath = path.resolve(settings.libraryFolder, 'libraryData.json')

    event.reply('send-library-data', libraryDataPath)
    event.returnValue = libraryDataPath
  } catch (e) {
    console.log(e)
    event.returnValue = e
  }
})

ipcMain.on('request-library-init', async (event) => {
  try {
    await initialize()
  } catch (e) {
    console.log(e)
    event.returnValue = e
  }
})

ipcMain.on('request-init-cancel', (event) => {
  console.log('Recieved cancel request')

  try {
    cancelInit()
  } catch (e) {
    console.log(e)
    event.returnValue = e
  }
})
