const { dialog, nativeImage } = require('electron')
const fs = require('./fileSystem')
const { APP_DIR, SETTINGS_FILE, pattern } = require('./constants')
const path = require('path')
const { getMainWindow } = require('./mainWindowState')
const ffmpeg = require('fluent-ffmpeg')

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
      library: libraryLocation,
      libraryFolder: path.resolve(libraryLocation, 'library')
    }

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings), 'utf8')

    exports.cancelInit()

    sender('send-app-settings', settings)
  } catch (e) {
    console.log(e)
  }
}

const createMetaReader = (settings) => async (metaPath, media) => {
  try {
    const metadata = await fs.readJson(metaPath)
    const hasThumbFile = (metadata && metadata.thumbPath) ? (await fs.exists(metadata.thumbPath)) : false
    const exists = media.indexOf(metadata.path) > -1

    if (
      exists &&
      metadata &&
      hasThumbFile &&
      metadata.thumbPath &&
      metadata.path &&
      metadata.createDate &&
      metadata.mediaType
    ) {
      return metadata
    }

    return null
  } catch (e) {
    console.log(e)
    console.log(metaPath)
  }
}

const createMetaWriter = (settings) => async (media) => {
  try {
    const meta = {
      path: media
    }
    const isVideo = pattern.VIDEO_REG.test(media)
    const isPhoto = pattern.PHOTO_REG.test(media)

    if (isVideo && !isPhoto) {
      meta.mediaType = 'video'
    } else if (isPhoto && !isVideo) {
      meta.mediaType = 'photo'
    }

    const googleMetaPath = media + '.json'
    const hasGoogleMeta = await fs.exists(googleMetaPath)
    if (hasGoogleMeta) {
      const googleMeta = await fs.readJson(googleMetaPath)

      meta.createDate = googleMeta.photoTakenTime.timestamp * 1000
    }

    try {
      if (pattern.JPG_EXTENSION_REG.test(media)) {
        const exifData = await fs.readExif(media)
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
    } catch (e) {}

    const fileName = media.split('/').pop()
    const metaPath = path.resolve(settings.libraryFolder, `metadata/${fileName}.json`)
    let thumbPath = path.resolve(settings.libraryFolder, `thumbnails/${fileName}`)
    if (meta.mediaType === 'photo') {
      const image = nativeImage.createFromPath(media)
      const size = image.getSize()
      const thumb = image.resize({
        width: 320,
        height: Math.ceil(size.height / size.width * 320)
      })

      thumbPath = thumbPath + '.jpg'

      await fs.writeFile(thumbPath, thumb.toJPEG(50))
    } else if (meta.mediaType === 'video') {
      thumbPath = thumbPath + '.png'
      await ffmpeg(media)
        .screenshots({
          count: 1,
          filename: path.basename(thumbPath),
          folder: path.dirname(thumbPath),
          size: '320x?'
        })
    }

    meta.thumbPath = thumbPath
    meta.metaPath = metaPath

    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8')
  } catch (e) {
    console.log(e)
    console.log(media)
  }
}

const promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([]))

const cancelledInits = {
  counter: 0
}

exports.initialize = async () => {
  const sender = createIpcSender()

  const id = ++cancelledInits.counter

  console.log('Begin initialize')

  sender('init-start')

  sender('init-progress', {
    status: 'Preparing',
    progress: 0
  })

  try {
    const settings = await fs.readJson(SETTINGS_FILE)
    const libraryDataPath = path.resolve(settings.libraryFolder, 'libraryData.json')

    const createAndWriteIndex = async (meta) => {
      const filteredMeta = meta.filter(Boolean)
      filteredMeta.sort((a, b) => {
        if (a.createDate < b.createDate) {
          return 1
        } else if (a.createDate > b.createDate) {
          return -1
        }
        return 0
      })

      const libraryData = {
        media: filteredMeta
      }

      await fs.writeFile(libraryDataPath, JSON.stringify(libraryData), 'utf8')
      sender('send-library-data', libraryDataPath)
    }

    const readPhotoMeta = createMetaReader(settings)
    const createPhotoMeta = createMetaWriter(settings)

    if (await fs.exists(settings.libraryFolder) === false) {
      await fs.mkdir(settings.libraryFolder)
    }

    if (await fs.exists(path.resolve(settings.libraryFolder, 'thumbnails')) === false) {
      await fs.mkdir(path.resolve(settings.libraryFolder, 'thumbnails'))
    }

    if (await fs.exists(path.resolve(settings.libraryFolder, 'metadata')) === false) {
      await fs.mkdir(path.resolve(settings.libraryFolder, 'metadata'))
    }

    sender('init-progress', {
      status: 'Finding media',
      progress: 0
    })

    const files = await fs.glob(`${settings.library}/**/*`)
    const media = files.filter(file =>
      !pattern.LIBRARY_FILE_REG.test(file) &&
      pattern.FILE_EXTENSION_REG.test(file) &&
      pattern.MEDIA_REG.test(file)
    )
    let metadataFiles = await fs.glob(`${settings.libraryFolder}/metadata/*`)

    console.log('Found ' + media.length + ' media')
    console.log('Found ' + metadataFiles.length + ' meta files')

    const readMetaFuncs = metadataFiles.map(
      (meta, index) => () => {
        if (cancelledInits[id]) {
          return Promise.resolve()
        }

        return readPhotoMeta(meta, media)
          .then(res => {
            sender('init-progress', {
              status: 'Getting metadata',
              progress: index / metadataFiles.length
            })

            return res
          })
      }
    )

    const validMetaData = await promiseSerial(readMetaFuncs)

    if (cancelledInits[id]) {
      sender('init-end')
      return
    }

    await createAndWriteIndex(validMetaData)

    sender('init-progress', {
      status: 'Finding files without metadata',
      progress: 0
    })

    let mediaWithMissing = []
    if (!cancelledInits[id]) {
      mediaWithMissing = media.filter(photo => !validMetaData.find(meta => meta && meta.path === photo))
    }

    console.log('Found ' + mediaWithMissing.length + ' media without valid metadata')

    if (cancelledInits[id]) {
      sender('init-end')
      return
    }

    const createMetaFuncs = mediaWithMissing.map(
      (photo, index) => () => {
        if (cancelledInits[id]) {
          return Promise.resolve()
        }

        return createPhotoMeta(photo)
          .then(res => {
            sender('init-progress', {
              status: 'Creating metadata',
              progress: index / mediaWithMissing.length
            })

            return res
          })
      }
    )

    await promiseSerial(createMetaFuncs)

    if (cancelledInits[id]) {
      sender('init-end')
      return
    }

    metadataFiles = await fs.glob(`${settings.libraryFolder}/metadata/*.json`)

    const indexMetaFuncs = metadataFiles.map(
      (meta, index) => () => {
        if (cancelledInits[id]) {
          return Promise.resolve()
        }
        return readPhotoMeta(meta, media)
          .then(res => {
            sender('init-progress', {
              status: 'Indexing',
              progress: index / metadataFiles.length
            })

            return res
          })
      }
    )

    if (cancelledInits[id]) {
      sender('init-end')
      return
    }

    const photoIndex = await promiseSerial(indexMetaFuncs)

    await createAndWriteIndex(photoIndex)

    sender('init-end')

    console.log('Finish initialize')
  } catch (e) {
    console.log(e)
  }
}

exports.cancelInit = () => {
  console.log('Cancelling init #' + cancelledInits.counter)
  cancelledInits[cancelledInits.counter] = true
}
