import React from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

const theme = {
  fontSize: {
    small: '1.2rem',
    body: '1.8rem',
    header: '2.2rem'
  },
  palette: {
    dark: {
      main: '#333'
    },
    common: {
      white: '#fff',
      black: '#000'
    }
  },
  mixins: {
    initProgress: {
      height: 40
    },
    selectionBar: {
      height: 60
    }
  }
}

const ThemeProvider = ({ children }) => (
  <StyledThemeProvider theme={theme}>
    {children}
  </StyledThemeProvider>
)

export default ThemeProvider
