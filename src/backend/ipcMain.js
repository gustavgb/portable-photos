const { ipcMain } = require('electron')
const fs = require('./fileSystem')
const { SETTINGS_FILE } = require('./constants')
const path = require('path')
const { initialize } = require('./utils')

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
    const libraryDataPath = path.resolve(settings.library, '.library/libraryData.json')

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
