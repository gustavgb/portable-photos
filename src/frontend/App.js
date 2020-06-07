import React, { useEffect } from 'react'
import styled from 'styled-components'
import { StoreProvider } from './state'
import { useSelector, useDispatch } from 'react-redux'
import { setSettings, setLibraryData, resetLibraryData } from './actions'
import ThemeProvider from './theme'
import InitProgress from './Components/InitProgress'
import Gallery from './Components/Gallery'
import InitScreen from './Components/InitScreen'

const Root = styled.div`
`

const App = () => {
  const dispatch = useDispatch()
  const settings = useSelector(state => state.settings)
  const libraryData = useSelector(state => state.library.data)
  const isInitializing = useSelector(state => state.init.isInitializing)

  useEffect(() => {
    const closeSettingsListener = window.ipcListen('send-app-settings', (event, nextSettings) => {
      console.log(nextSettings)

      dispatch(setSettings(nextSettings))

      if (settings.library !== nextSettings.library) {
        dispatch(resetLibraryData())

        if (window.confirm('Scan library now?')) {
          window.ipcSend('request-library-init')
        }
      }
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
      {isInitializing && !libraryData
        ? <InitScreen />
        : <Gallery photos={libraryData ? libraryData.photos : []} />}
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
