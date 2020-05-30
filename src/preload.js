const app = require('electron').remote
const glob = require('glob')
const dialog = app.dialog

window.nodeSelectFolder = async () => {
  console.log('Opening folder browser')

  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })

  const files = result.filePaths[0]

  return files
}

window.nodeDiscoverFiles = (folder) => new Promise((resolve, reject) => {
  console.log('Discovering files inside ' + folder)

  const reg = /\.(png|jpg|jpeg|gif|svg)$/i

  glob(
    `${folder}/**/*`,
    (err, files) => {
      if (err) {
        reject(err)
      }

      const images = files.filter(file => reg.test(file))

      resolve(images)
    }
  )
})
