import React, { useReducer, useEffect, useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import Thumbnail from './Thumbnail'
import { useSelector } from 'react-redux'

const encodePath = (path) => {
  return encodeURI(path).replace(/\)/g, 'CLOSING_PAREN').replace(/\(/g, 'OPEN_PAREN')
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_IMAGES':
      return action.images.map((image, index) => ({
        ...image,
        index,
        path: `http://localhost:3001${encodePath(image.path)}`,
        thumbnail: `http://localhost:3001${encodePath(image.thumbPath)}`,
        isSelected: false
      }))
    case 'TOGGLE_SELECTED':
      return state.map((image) => image.index === action.index ? ({
        ...image,
        isSelected: !image.isSelected
      }) : image)
    case 'TOGGLE_MULTIPLE':
      return state.map((image) => (image.index <= action.to && image.index >= action.from) ? ({
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

const Gallery = () => {
  const libraryMedia = useSelector(state => state.library.data ? state.library.data.media : [])
  const libraryLastUpdate = useSelector(state => state.library.lastUpdate)
  const [images, dispatch] = useReducer(reducer, [])
  const keys = useSelector(state => state.keys)
  const [lastSelected, setLastSelected] = useState(-1)
  const [hovered, setHover] = useState(-1)
  const [columns, setColumns] = useState(0)
  const [rows, setRows] = useState(0)
  const [cellHeight, setCellHeight] = useState(0)
  const [firstRow, setFirstRow] = useState(0)
  const [visibleCells, setVisibleCells] = useState(0)
  const [updatedTs, setUpdatedTs] = useState(0)
  const outerRef = useRef(null)

  const visibleImages = useMemo(
    () => images.slice(firstRow * columns, firstRow * columns + visibleCells),
    [firstRow, columns, visibleCells, images.length, updatedTs]
  )

  const selectMultiple = Boolean(keys.Shift) && lastSelected !== -1
  const selectStart = selectMultiple ? Math.min(hovered, lastSelected) : -1
  const selectEnd = selectMultiple ? Math.max(hovered, lastSelected) : -1

  useEffect(() => {
    dispatch({ type: 'SET_IMAGES', images: libraryMedia })
  }, [libraryLastUpdate])

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
  }, [cellHeight, columns, window.scrollY, window.innerHeight])

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
    setUpdatedTs(Date.now())
  }

  return (
    <Container ref={outerRef} height={cellHeight * rows}>
      <Grid offset={firstRow * cellHeight}>
        {visibleImages.map((image) => (
          <Thumbnail
            key={image.thumbnail}
            src={image.thumbnail}
            isVideo={image.mediaType === 'video'}
            onSelect={() => handleSelect(image.index, image.isSelected)}
            onMouseEnter={() => setHover(image.index)}
            onMouseLeave={() => setHover(-1)}
            isSelected={image.isSelected}
            isHovered={(
              selectStart <= image.index &&
              selectEnd >= image.index
            )}
          />
        ))}
      </Grid>
    </Container>
  )
}

export default Gallery
