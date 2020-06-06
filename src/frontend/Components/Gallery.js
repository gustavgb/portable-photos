import React, { useReducer, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Photo from './Photo'
import { useSelector } from 'react-redux'

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
    case 'TOGGLE_MULTIPLE':
      return state.map((image, index) => (index <= action.to && index >= action.from) ? ({
        ...image,
        isSelected: true
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
  const keys = useSelector(state => state.keys)
  const [lastSelected, setLastSelected] = useState(-1)
  const [hovered, setHover] = useState(-1)
  const selectMultiple = Boolean(keys.Shift)
  const selectStart = selectMultiple ? Math.min(hovered, lastSelected) : -1
  const selectEnd = selectMultiple ? Math.max(hovered, lastSelected) : -1

  useEffect(() => {
    dispatch({ type: 'SET_IMAGES', images: libraryPhotos })
  }, [libraryPhotos.length])

  const handleSelect = (index, prevSelected) => {
    if (!selectMultiple) {
      dispatch({ type: 'TOGGLE_SELECTED', index })
      if (prevSelected) {
        setLastSelected(-1)
      } else {
        setLastSelected(index)
      }
    } else {
      dispatch({ type: 'TOGGLE_MULTIPLE', from: selectStart, to: selectEnd })
    }
  }

  return (
    <Container>
      {images.map((image, index) => (
        <Photo
          key={image.thumbnail}
          src={image.thumbnail}
          onSelect={() => handleSelect(index, image.isSelected)}
          onMouseEnter={() => setHover(index)}
          onMouseLeave={() => setHover(-1)}
          isSelected={image.isSelected}
          isHovered={(
            selectStart <= index &&
            selectEnd >= index
          )}
        />
      ))}
    </Container>
  )
}

export default Gallery
