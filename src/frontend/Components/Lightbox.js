import React, { useEffect, useRef } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { moveLightboxSelected, setLightboxSelected } from '../actions'

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
`

const Image = styled.img.attrs(props => ({
  src: props.src
}))`
  object-fit: contain;
  width: 100%;
  height: 100%;
`

const Video = styled.video.attrs(props => ({
  controls: true,
  autoPlay: true,
  disablePictureInPicture: true
}))`
  object-fit: contain;
  width: 100%;
  height: 100%;

  &:focus {
    outline: none;
  }
`

const Lightbox = () => {
  const dispatch = useDispatch()
  const libraryMedia = useSelector(state => state.library.media || [])
  const selectedIndex = useSelector(state => state.lightbox.selected)
  const containerRef = useRef(null)
  const selectedMedia = libraryMedia[selectedIndex]
  const open = selectedIndex !== -1

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          dispatch(moveLightboxSelected(-1))
          break
        case 'ArrowRight':
          dispatch(moveLightboxSelected(1))
          break
        case 'Escape':
          dispatch(setLightboxSelected(-1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const handleOutsideClick = (e) => {
    if (e.target === containerRef.current) {
      dispatch(setLightboxSelected(-1))
    }
  }

  return (
    <>
      {open && <GlobalStyle />}
      <Container open={open} onClick={handleOutsideClick} ref={containerRef}>
        {selectedMedia && selectedMedia.mediaType === 'photo' && (
          <Image src={selectedMedia.path} />
        )}
        {selectedMedia && selectedMedia.mediaType === 'video' && (
          <Video>
            <source src={selectedMedia.path} />
          </Video>
        )}
      </Container>
    </>
  )
}

export default Lightbox
