const fs = require('../fileSystem')
const { SETTINGS_FILE } = require('../constants')
const path = require('path')
const { createIpcSender } = require('./common')
const { createIndex } = require('./indexing')

exports.createAlbum = async (options) => {
  const sender = createIpcSender()

  try {
    console.log('Creating new album')

    const settings = await fs.readJson(SETTINGS_FILE)

    if (await fs.exists(path.resolve(settings.libraryFolder, 'albums')) === false) {
      await fs.mkdir(path.resolve(settings.libraryFolder, 'albums'))
    }

    const id = Date.now()

    const paths = options.items
    const name = options.name

    const album = {
      id,
      name,
      paths
    }

    await fs.writeFile(path.resolve(settings.libraryFolder, 'albums', `${id}.json`), JSON.stringify(album), 'utf8')

    sender('new-album-created', { id, name })

    await createIndex(settings)
  } catch (e) {
    console.log(e)
  }
}
