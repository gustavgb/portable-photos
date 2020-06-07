const { nativeImage } = require('electron')
const fs = require('../fileSystem')
const { SETTINGS_FILE, pattern } = require('../constants')
const path = require('path')
const { createIpcSender, getMediaFiles } = require('./common')
const { createIndex } = require('./indexing')
const { getId, isCancelled } = require('./cancelledServices')

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
      await fs.createThumb(media, thumbPath)
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

exports.initialize = async () => {
  const sender = createIpcSender()

  const id = getId()

  console.log('Begin initialize')

  sender('send-status', {
    cancelId: id,
    label: 'Preparing',
    progress: 0
  })

  try {
    const settings = await fs.readJson(SETTINGS_FILE)

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

    sender('send-status', {
      cancelId: id,
      label: 'Finding media',
      progress: 0
    })

    const media = await getMediaFiles(settings)
    const validMetaData = await createIndex(settings, media, id)

    sender('send-status', {
      cancelId: id,
      label: 'Finding files without metadata',
      progress: 0
    })

    if (isCancelled(id)) {
      sender('end-status')
      return
    }

    const mediaWithMissing = media.filter(photo => !validMetaData.find(meta => meta && meta.path === photo))

    console.log('Found ' + mediaWithMissing.length + ' media without valid metadata')

    if (isCancelled(id) || mediaWithMissing.length === 0) {
      sender('end-status')
      return
    }

    const createMetaFuncs = mediaWithMissing.map(
      (photo, index) => () => {
        if (isCancelled(id)) {
          return Promise.resolve()
        }

        return createPhotoMeta(photo)
          .then(res => {
            sender('send-status', {
              cancelId: id,
              label: 'Creating metadata',
              progress: index / mediaWithMissing.length
            })

            return res
          })
      }
    )

    await promiseSerial(createMetaFuncs)

    if (isCancelled(id)) {
      sender('end-status')
      return
    }

    await createIndex(settings, media, id)

    sender('end-status')

    console.log('Finish initialize')
  } catch (e) {
    console.log(e)
  }
}
