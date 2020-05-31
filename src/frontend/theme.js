import React from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

const theme = {
  fontSize: {
    body: '1.2rem'
  }
}

const ThemeProvider = ({ children }) => (
  <StyledThemeProvider theme={theme}>
    {children}
  </StyledThemeProvider>
)

export default ThemeProvider
