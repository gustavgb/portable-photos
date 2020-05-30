import './index.css'

console.log('👋 This message is being logged by "renderer.js", included via webpack')

window.selectFolder = function () {
  window.nodeSelectFolder().then((result) => console.log(result))
}

window.discoverFiles = function (folder) {
  window.nodeDiscoverFiles(folder).then((result) => console.log(result))
}
