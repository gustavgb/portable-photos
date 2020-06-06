const { dialog, nativeImage } = require('electron')
const fs = require('./fileSystem')
const { APP_DIR, SETTINGS_FILE, pattern } = require('./constants')
const path = require('path')
const { getMainWindow } = require('./mainWindowState')

const createIpcSender = () => {
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

exports.setLibraryLocation = async () => {
  const sender = createIpcSender()
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

    sender('send-app-settings', settings)
  } catch (e) {
    console.log(e)
  }
}

const createMetaReader = (settings) => async (metaPath) => {
  try {
    const metadata = await fs.readJson(metaPath)
    const hasThumbFile = (metadata && metadata.thumbPath) ? (await fs.exists(metadata.thumbPath)) : false

    if (
      metadata &&
      hasThumbFile &&
      metadata.size &&
      metadata.size.width &&
      metadata.size.height &&
      metadata.thumbSize &&
      metadata.thumbSize.width &&
      metadata.thumbSize.height &&
      metadata.thumbPath &&
      metadata.path
    ) {
      return metadata
    }

    return null
  } catch (e) {
    console.log(e)
    console.log(metaPath)
  }
}

const createMetaWriter = (settings) => async (photo) => {
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

    const image = nativeImage.createFromPath(photo)
    const size = image.getSize()
    const thumb = image.resize({
      width: 320,
      height: Math.ceil(size.height / size.width * 320)
    })
    const thumbSize = thumb.getSize()

    const fileName = photo.split('/').pop()
    const thumbPath = path.resolve(settings.library, `.library/thumbnails/${fileName}.jpg`)
    const metaPath = path.resolve(settings.library, `.library/metadata/${fileName}.json`)

    await fs.writeFile(thumbPath, thumb.toJPEG(50))

    meta.size = {
      width: size.width,
      height: size.height
    }
    meta.thumbSize = {
      width: thumbSize.width,
      height: thumbSize.height
    }
    meta.thumbPath = thumbPath
    meta.metaPath = metaPath

    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8')
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
  const sender = createIpcSender()

  console.log('Begin initialize')

  sender('init-start')

  sender('init-progress', {
    status: 'Preparing',
    progress: 0
  })

  try {
    const settings = await fs.readJson(SETTINGS_FILE)

    const readPhotoMeta = createMetaReader(settings)
    const createPhotoMeta = createMetaWriter(settings)

    if (await fs.exists(path.resolve(settings.library, '.library')) === false) {
      await fs.mkdir(path.resolve(settings.library, '.library'))
    }

    if (await fs.exists(path.resolve(settings.library, '.library/thumbnails')) === false) {
      await fs.mkdir(path.resolve(settings.library, '.library/thumbnails'))
    }

    if (await fs.exists(path.resolve(settings.library, '.library/metadata')) === false) {
      await fs.mkdir(path.resolve(settings.library, '.library/metadata'))
    }

    sender('init-progress', {
      status: 'Finding photos',
      progress: 0
    })

    const files = await fs.glob(`${settings.library}/**/*`)
    const photos = files.filter(file =>
      !pattern.LIBRARY_FILE_REG.test(file) &&
      pattern.FILE_EXTENSION_REG.test(file) &&
      pattern.PHOTO_REG.test(file)
    )
    let metadataFiles = await fs.glob(`${settings.library}/.library/metadata/*`)

    console.log('Found ' + photos.length + ' photos')
    console.log('Found ' + metadataFiles.length + ' meta files')

    const readMetaFuncs = metadataFiles.map(
      (meta, index) => () =>
        readPhotoMeta(meta)
          .then(res => {
            sender('init-progress', {
              status: 'Getting metadata',
              progress: index / photos.length
            })

            return res
          })
    )

    const validMetaData = await promiseSerial(readMetaFuncs)

    sender('init-progress', {
      status: 'Finding files without metadata',
      progress: 0
    })

    const photosWithMissing = photos.filter(photo => !validMetaData.find(meta => meta && meta.path === photo))

    const createMetaFuncs = photosWithMissing.map(
      (photo, index) => () =>
        createPhotoMeta(photo)
          .then(res => {
            sender('init-progress', {
              status: 'Creating metadata',
              progress: index / photosWithMissing.length
            })

            return res
          })
    )

    await promiseSerial(createMetaFuncs)

    metadataFiles = await fs.glob(`${settings.library}/.library/metadata/*`)

    const indexMetaFuncs = metadataFiles.map(
      (meta, index) => () =>
        readPhotoMeta(meta)
          .then(res => {
            sender('init-progress', {
              status: 'Indexing',
              progress: index / photosWithMissing.length
            })

            return res
          })
    )

    const photoIndex = await promiseSerial(indexMetaFuncs)

    const libraryData = {
      photos: photoIndex
    }

    const libraryDataPath = path.resolve(settings.library, '.library/libraryData.json')
    await fs.writeFile(libraryDataPath, JSON.stringify(libraryData), 'utf8')

    sender('send-library-data', libraryDataPath)
    sender('init-end')

    console.log('Finish initialize')
  } catch (e) {
    console.log(e)
  }
}
