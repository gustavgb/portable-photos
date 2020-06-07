const fs = require('../fileSystem')
const path = require('path')
const { createIpcSender, promiseSerial, getMediaFiles } = require('./common')

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

exports.createIndex = async (settings, media) => {
  const sender = createIpcSender()
  const readPhotoMeta = createMetaReader(settings)

  try {
    console.log('Indexing')

    if (!media) {
      media = await getMediaFiles(settings)
    }
    const metadataFiles = await fs.glob(`${settings.libraryFolder}/metadata/*`)

    console.log('Found ' + media.length + ' media')
    console.log('Found ' + metadataFiles.length + ' meta files')

    const readMetaFuncs = metadataFiles.map(
      (meta, index) => () => {
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

    const validMeta = await promiseSerial(readMetaFuncs)

    const libraryDataPath = path.resolve(settings.libraryFolder, 'libraryData.json')
    const filteredMeta = validMeta.filter(Boolean)
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

    sender('progress-finished')

    return filteredMeta
  } catch (e) {
    console.log(e)
  }
}
