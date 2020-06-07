import React, { useRef } from 'react'
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle({
  body: {
    overflow: 'hidden'
  }
})

const Container = styled.div`
  pointer-events: ${props => props.open ? 'all' : 'none'};
  opacity: ${props => props.open ? 1 : 0};
  transition: all .5s ease-out;
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 500;
`

const Modal = ({ children = null, open = false, onClose = () => null, unmount = false }) => {
  const containerRef = useRef(null)

  const handleOutsideClick = (e) => {
    if (e.target === containerRef.current) {
      onClose()
    }
  }

  return (
    <>
      {open && <GlobalStyle />}
      <Container open={open} onClick={handleOutsideClick} ref={containerRef}>
        {(!unmount || open) && children}
      </Container>
    </>
  )
}

export default Modal
