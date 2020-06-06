const express = require('express')
const app = express()
const port = 3001

app.get('*', (req, res) => {
  res.sendFile(req.url)
})

app.listen(port, () => console.log(`Serving files from http://localhost:${port}`))
