import 'regenerator-runtime'
import 'core-js'

import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './frontend/App'

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
module.hot.accept()
