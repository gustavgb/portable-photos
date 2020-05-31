const app = require('electron')
const fs = require('./fileSystem')
const dialog = app.dialog
const { APP_DIR, SETTINGS_FILE, pattern } = require('./constants')
const window = require('electron').BrowserWindow

exports.setLibraryLocation = async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    const libraryLocation = result.filePaths[0]

    if ((await fs.exists(APP_DIR)) === false) {
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

exports.initialize = async () => {
  const focusedWindow = window.getFocusedWindow()

  console.log('Begin initialize')

  focusedWindow.webContents.send('init-progress', {
    status: 'finding-photos',
    progress: 0
  })

  try {
    const settings = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'))

    const files = await fs.glob(`${settings.library}/**/*`)
    const photos = files.filter(file => pattern.PHOTO_REG.test(file))

    console.log('Found ' + photos.length + ' photos')

    focusedWindow.webContents.send('init-progress', {
      status: 'getting-google-photos-meta',
      progress: 0
    })

    photos.forEach(async (photo, index) => {
      const googleMetaPath = photo.replace(pattern.FILE_EXTENSION_REG, '.json')
      const hasGoogleMeta = await fs.exists(googleMetaPath)
      if (hasGoogleMeta) {
        const googleMeta = JSON.parse(await fs.readFile(googleMetaPath, 'utf8'))
      }

      focusedWindow.webContents.send('init-progress', {
        status: 'getting-google-photos-meta',
        progress: index / photos.length
      })
    })
  } catch (e) {
    console.log(e)
  }
}
