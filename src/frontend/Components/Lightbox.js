import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { moveLightboxSelected, setLightboxSelected } from '../actions'
import Modal from './Modal'

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
  const album = useSelector(state => state.library.albums.find(album => album.id === state.library.currentAlbum) || {})
  const media = album.media || []
  const selectedIndex = useSelector(state => state.lightbox.selected)
  const selectedMedia = media[selectedIndex]
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

  const handleClose = () => {
    dispatch(setLightboxSelected(-1))
  }

  return (
    <Modal open={open} onClose={handleClose}>
      {selectedMedia && selectedMedia.mediaType === 'photo' && (
        <Image src={selectedMedia.path} />
      )}
      {selectedMedia && selectedMedia.mediaType === 'video' && (
        <Video>
          <source src={selectedMedia.path} />
        </Video>
      )}
    </Modal>
  )
}

export default Lightbox
