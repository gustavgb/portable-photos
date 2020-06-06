import React, { useReducer, useEffect } from 'react'
import styled from 'styled-components'
import Photo from './Photo'

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_IMAGES':
      return action.images.map(image => ({
        src: `http://localhost:3001${image.path}`,
        thumbnail: `http://localhost:3001${image.thumbPath}`,
        thumbnailHeight: image.thumbSize.height,
        thumbnailWidth: image.thumbSize.width,
        isSelected: false
      }))
    case 'TOGGLE_SELECTED':
      return state.map((image, index) => index === action.index ? ({
        ...image,
        isSelected: !image.isSelected
      }) : image)
    default:
      return state
  }
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
`

const Gallery = ({ photos: libraryPhotos }) => {
  const [images, dispatch] = useReducer(reducer, [])

  useEffect(() => {
    dispatch({ type: 'SET_IMAGES', images: libraryPhotos })
  }, [libraryPhotos.length])

  const handleSelect = (index) => {
    dispatch({ type: 'TOGGLE_SELECTED', index })
  }

  return (
    <Container>
      {images.map((image, index) => (
        <Photo
          key={image.thumbnail}
          src={image.thumbnail}
          onSelect={() => handleSelect(index)}
          isSelected={image.isSelected}
        />
      ))}
    </Container>
  )
}

export default Gallery
