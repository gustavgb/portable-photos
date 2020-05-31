import React, { useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { StoreProvider } from './state'
import { useSelector, useDispatch } from 'react-redux'
import Button from './Blocks/Button'
import { setSettings, setLibraryData } from './actions'
import Typography from './Blocks/Typography'
import ThemeProvider from './theme'

const Root = styled.div`
  padding: 5px;
`

const App = () => {
  const dispatch = useDispatch()
  const libraryData = useSelector(state => state.library.data)
  const libraryStatus = useSelector(state => state.library.status)
  const libraryPath = useSelector(state => state.settings.library || '')
  const libraryNotFound = libraryStatus === 'loaded' && !libraryData

  useEffect(() => {
    window.ipcListen('send-app-settings', (event, settings) => {
      console.log(settings)
      window.ipcSend('request-library-data')

      dispatch(setSettings(settings))
    })
    window.ipcListen('send-library-data', (event, data) => {
      console.log('Library data:', data)

      dispatch(setLibraryData(data))
    })
    window.ipcListen('init-progress', (event, progress) => {
      console.log(`${(progress.progress * 100).toFixed(2)}%: ${progress.status}`)
    })

    window.ipcSend('request-app-settings')
  }, [])

  const handleInit = useCallback(() => {
    window.ipcSend('request-library-init')
  })

  return (
    <Root>
      {libraryNotFound && (
        <Typography>
          The folder at&nbsp;
          <strong>{libraryPath}</strong>&nbsp;
          has not been initialized as a library. Do that now?
          <Button onClick={handleInit}>Initialize</Button>
        </Typography>
      )}
    </Root>
  )
}

const AppContainer = () => (
  <StoreProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StoreProvider>
)

export default AppContainer
