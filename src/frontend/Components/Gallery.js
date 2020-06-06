import React, { useReducer, useEffect, useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import Photo from './Photo'
import { useSelector } from 'react-redux'

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_IMAGES':
      return action.images.map((image, index) => ({
        index,
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

const Container = styled.div.attrs(props => ({
  style: {
    height: `${props.height}px`
  }
}))`
  position: relative;
`

const Grid = styled.div.attrs(props => ({
  style: {
    top: `${props.offset}px`
  }
}))`
  position: absolute;
  left: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
  width: 100%;
  padding: 1rem;
`

const Gallery = ({ photos: libraryPhotos }) => {
  const [images, dispatch] = useReducer(reducer, [])
  const keys = useSelector(state => state.keys)
  const [lastSelected, setLastSelected] = useState(-1)
  const [hovered, setHover] = useState(-1)
  const [columns, setColumns] = useState(0)
  const [rows, setRows] = useState(0)
  const [cellHeight, setCellHeight] = useState(0)
  const [firstRow, setFirstRow] = useState(0)
  const [visibleCells, setVisibleCells] = useState(0)
  const outerRef = useRef(null)

  const visibleImages = useMemo(
    () => images.slice(firstRow * columns, firstRow * columns + visibleCells),
    [firstRow, columns, visibleCells, images.length]
  )

  const selectMultiple = Boolean(keys.Shift) && lastSelected !== -1
  const selectStart = selectMultiple ? Math.min(hovered, lastSelected) : -1
  const selectEnd = selectMultiple ? Math.max(hovered, lastSelected) : -1

  useEffect(() => {
    dispatch({ type: 'SET_IMAGES', images: libraryPhotos })
  }, [libraryPhotos.length])

  useEffect(() => {
    const onResize = () => {
      const rect = outerRef.current.getBoundingClientRect()
      const width = rect.width
      const columns = Math.floor((width - 10) / 160)
      const rows = Math.ceil(images.length / columns)
      const cellHeight = (width - 10) / columns

      setColumns(columns)
      setCellHeight(cellHeight)
      setRows(rows)
    }

    onResize()

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [images.length])

  useEffect(() => {
    const onScroll = () => {
      setFirstRow(Math.max(Math.floor(window.scrollY / cellHeight) - 1, 0) || 0)
      setVisibleCells((Math.ceil(window.innerHeight / cellHeight) + 2) * columns || 0)
    }

    onScroll()

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [cellHeight, columns])

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

  console.log(firstRow, visibleCells, visibleImages.length)

  return (
    <Container ref={outerRef} height={cellHeight * rows}>
      <Grid offset={firstRow * cellHeight}>
        {visibleImages.map((image, index) => (
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
      </Grid>
    </Container>
  )
}

export default Gallery
