import React from 'react'
import styled from 'styled-components'

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100vh - ${props => props.theme.mixins.initProgress.height}px);
  font-size: ${props => props.theme.fontSize.header};
`

const InitScreen = () => {
  return (
    <Root>
      Initializing library...
    </Root>
  )
}

export default InitScreen
