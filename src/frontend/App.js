import React, { useEffect } from 'react'
import styled from 'styled-components'
import { StoreProvider } from './state'
import { useSelector, useDispatch } from 'react-redux'
import { setSettings, setLibraryData } from './actions'
import ThemeProvider from './theme'
import InitProgress from './Components/InitProgress'
import Gallery from './Components/Gallery'

const Root = styled.div`
  padding: 5px;
`

const App = () => {
  const dispatch = useDispatch()
  const libraryData = useSelector(state => state.library.data)
  const libraryStatus = useSelector(state => state.library.status)

  useEffect(() => {
    console.log('Init')

    const closeSettingsListener = window.ipcListen('send-app-settings', (event, settings) => {
      console.log(settings)

      dispatch(setSettings(settings))
    })
    const closeLibraryListener = window.ipcListen('send-library-data', async (event, path) => {
      console.log('Library data can be found at ' + path)

      const libraryData = await window.readLibraryData(path)

      dispatch(setLibraryData(libraryData))
    })
    window.ipcSend('request-library-data')

    const handleKeyUp = (e) => {
      dispatch({ type: 'KEY_UP', key: e.key })
    }
    const handleKeyDown = (e) => {
      dispatch({ type: 'KEY_DOWN', key: e.key })
    }
    const handleBlur = () => {
      dispatch({ type: 'RESET_KEYS' })
    }
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleBlur)

    return () => {
      closeSettingsListener()
      closeLibraryListener()
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <Root>
      {libraryStatus === 'loaded' && (
        <>
          <Gallery photos={libraryData ? libraryData.photos : []} />
          <InitProgress />
        </>
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
