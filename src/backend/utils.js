const app = require('electron')
const fs = require('./fileSystem')
const dialog = app.dialog
const { APP_DIR, SETTINGS_FILE, pattern } = require('./constants')
const window = require('electron').BrowserWindow
const path = require('path')

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

const readPhotoMeta = async (photo, index) => {
  try {
    const meta = {
      path: photo
    }
    const googleMetaPath = photo + '.json'
    const hasGoogleMeta = await fs.exists(googleMetaPath)
    if (hasGoogleMeta) {
      const googleMeta = await fs.readJson(googleMetaPath)

      meta.createDate = googleMeta.photoTakenTime.timestamp * 1000
    }

    if (pattern.JPG_EXTENSION_REG.test(photo)) {
      const exifData = await fs.readExif(photo)
      let createDateRaw
      if (exifData.exif) {
        createDateRaw = exifData.exif.CreateDate
      } else if (exifData.image) {
        createDateRaw = exifData.image.ModifyDate
      }
      if (createDateRaw) {
        const createDate = createDateRaw.split(' ').map((str, i) => i === 0 ? str.replace(/:/g, '-') : str).join(' ')
        meta.createDate = new Date(createDate).getTime()
      }
    }

    return meta
  } catch (e) {
    console.log(e)
    console.log(photo)
  }
}

const promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([]))

exports.initialize = async () => {
  const focusedWindow = window.getFocusedWindow()

  console.log('Begin initialize')

  focusedWindow.webContents.send('init-start')

  focusedWindow.webContents.send('init-progress', {
    status: 'Finding photos',
    progress: 0
  })

  try {
    const settings = await fs.readJson(SETTINGS_FILE)

    const files = await fs.glob(`${settings.library}/**/*`)
    const photos = files.filter(file => pattern.FILE_EXTENSION_REG.test(file) && pattern.PHOTO_REG.test(file))

    console.log('Found ' + photos.length + ' photos')

    focusedWindow.webContents.send('init-progress', {
      status: 'Getting metadata from photos',
      progress: 0
    })

    const readPhotoFuncs = photos.map(
      (photo, index) => () =>
        readPhotoMeta(photo, index)
          .then(res => {
            focusedWindow.webContents.send('init-progress', {
              status: 'Getting metadata from photos',
              progress: index / photos.length
            })

            return res
          })
    )

    const photoIndex = await promiseSerial(readPhotoFuncs)

    focusedWindow.webContents.send('init-progress', {
      status: 'Writing metadata',
      progress: 0
    })

    console.log(photoIndex)

    const libraryData = {
      photos: photoIndex
    }

    if (await fs.exists(path.resolve(settings.library, '.library')) === false) {
      await fs.mkdir(path.resolve(settings.library, '.library'))
    }

    const libraryDataPath = path.resolve(settings.library, '.library/libraryData.json')
    await fs.writeFile(libraryDataPath, JSON.stringify(libraryData), 'utf8')

    focusedWindow.webContents.send('send-library-data', libraryDataPath)
    focusedWindow.webContents.send('init-end')
  } catch (e) {
    console.log(e)
  }
}
