import React from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

const theme = {
  fontSize: {
    body: '1.2rem'
  },
  palette: {
    dark: {
      main: '#333'
    },
    common: {
      white: '#fff',
      black: '#000'
    }
  }
}

const ThemeProvider = ({ children }) => (
  <StyledThemeProvider theme={theme}>
    {children}
  </StyledThemeProvider>
)

export default ThemeProvider
