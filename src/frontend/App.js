import React, { useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { StoreProvider } from './state'
import { useSelector, useDispatch } from 'react-redux'
import Button from './Blocks/Button'
import { setSettings, setLibraryData } from './actions'
import Typography from './Blocks/Typography'
import ThemeProvider from './theme'
import InitProgress from './Components/InitProgress'

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
    window.ipcListen('send-library-data', async (event, path) => {
      console.log('Library data can be found at ' + path)

      const libraryData = await window.readLibraryData(path)

      dispatch(setLibraryData(libraryData))
    })

    window.ipcSend('request-library-init')
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
      <InitProgress />
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
