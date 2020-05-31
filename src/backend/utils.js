const app = require('electron')
const fs = require('./fileSystem')
const dialog = app.dialog
const { APP_DIR, SETTINGS_FILE } = require('./constants')
const window = require('electron').BrowserWindow

exports.setLibraryLocation = async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    const libraryLocation = result.filePaths[0]

    try {
      await fs.lstat(APP_DIR)
    } catch (e) {
      await fs.mkdir(APP_DIR)
    }

    const settings = {
      library: libraryLocation
    }

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings), 'utf8')

    const focusedWindow = window.getFocusedWindow()
    focusedWindow.webContents.send('send-app-settings', settings)
  } catch (e) {
    console.log(e)
  }
}
