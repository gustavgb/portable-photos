const express = require('express')
const app = express()
const port = 3001
const nocache = require('nocache')

const decodePath = (path) => {
  return decodeURI(path).replace(/CLOSING_PAREN/g, ')').replace(/OPEN_PAREN/g, '(')
}

app.use(nocache())

app.get('*', (req, res) => {
  res.sendFile(decodePath(req.url))
})

app.listen(port, () => console.log(`Serving files from http://localhost:${port}`))
