const { dialog } = require('electron')
const fs = require('../fileSystem')
const { APP_DIR, SETTINGS_FILE } = require('../constants')
const path = require('path')
const { createIpcSender } = require('./common')

exports.setLibraryLocation = async () => {
  const sender = createIpcSender()
  try {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    const libraryLocation = result.filePaths[0]

    if ((await fs.exists(APP_DIR)) === false) {
      await fs.mkdir(APP_DIR)
    }

    const settings = {
      library: libraryLocation,
      libraryFolder: path.resolve(libraryLocation, 'library')
    }

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings), 'utf8')

    sender('send-app-settings', settings)
  } catch (e) {
    console.log(e)
  }
}
