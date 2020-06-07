const fs = require('../fileSystem')
const { SETTINGS_FILE } = require('../constants')
const path = require('path')
const { createIndex } = require('./indexing')

exports.createAlbum = async (options) => {
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

    await createIndex(settings)
  } catch (e) {
    console.log(e)
  }
}

exports.updateAlbum = async (options) => {
  try {
    console.log('Updating album: ' + options.id)

    const settings = await fs.readJson(SETTINGS_FILE)

    if (await fs.exists(path.resolve(settings.libraryFolder, 'albums')) === false) {
      await fs.mkdir(path.resolve(settings.libraryFolder, 'albums'))
    }

    let data = {}
    if (await fs.exists(path.resolve(settings.libraryFolder, 'albums', options.id + '.json'))) {
      data = await fs.readJson(path.resolve(settings.libraryFolder, 'albums', options.id + '.json'))
    }

    const paths = options.items

    const album = {
      ...data,
      paths
    }

    await fs.writeFile(path.resolve(settings.libraryFolder, 'albums', `${options.id}.json`), JSON.stringify(album), 'utf8')

    await createIndex(settings)
  } catch (e) {
    console.log(e)
  }
}

exports.deleteAlbum = async (options) => {
  try {
    console.log('Deleting album: ' + options.id)

    const settings = await fs.readJson(SETTINGS_FILE)

    if (await fs.exists(path.resolve(settings.libraryFolder, 'albums')) === false) {
      await fs.mkdir(path.resolve(settings.libraryFolder, 'albums'))
    }

    if (await fs.exists(path.resolve(settings.libraryFolder, 'albums', options.id + '.json'))) {
      await fs.unlink(path.resolve(settings.libraryFolder, 'albums', options.id + '.json'))
    }

    await createIndex(settings)
  } catch (e) {
    console.log(e)
  }
}
