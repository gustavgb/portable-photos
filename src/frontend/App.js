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

    window.ipcListen('send-app-settings', (event, settings) => {
      console.log(settings)

      dispatch(setSettings(settings))
    })
    window.ipcListen('send-library-data', async (event, path) => {
      console.log('Library data can be found at ' + path)

      const libraryData = await window.readLibraryData(path)

      dispatch(setLibraryData(libraryData))
    })
    window.ipcSend('request-library-data')
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
