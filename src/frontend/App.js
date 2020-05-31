import React, { useEffect } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  padding: 5px;
  font-style: italic;
`

const App = () => {
  useEffect(() => {
    window.ipcListen('send-app-settings', (event, arg) => {
      console.log(arg)
    })

    window.ipcSend('request-app-settings')
  }, [])

  return (
    <Root>
      This is the app! Yes dude
    </Root>
  )
}

export default App
