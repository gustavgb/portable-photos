import React, { useEffect, useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import Thumbnail from './Thumbnail'
import { useSelector, useDispatch } from 'react-redux'
import { toggleMultiple, toggleSelected, setLightboxSelected, clearSelected, setCurrentAlbum, selectAll } from '../actions'
import Typography from '../Blocks/Typography'
import Button from '../Blocks/Button'

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
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
  width: 100%;
  padding: 1rem;
`

const Centered = styled.div`
  padding: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Gallery = () => {
  const dispatch = useDispatch()
  const album = useSelector(state => state.library.albums.find(album => album.id === state.library.currentAlbum) || {})
  const media = album.media || []
  const currentAlbum = useSelector(state => state.library.currentAlbum)
  const libraryLastUpdate = useSelector(state => state.library.lastUpdate)
  const keys = useSelector(state => state.keys)
  const selectedIndex = useSelector(state => state.lightbox.selected)
  const [lastSelected, setLastSelected] = useState(-1)
  const [hovered, setHover] = useState(-1)
  const [columns, setColumns] = useState(0)
  const [rows, setRows] = useState(0)
  const [cellHeight, setCellHeight] = useState(0)
  const [firstRow, setFirstRow] = useState(0)
  const [visibleCells, setVisibleCells] = useState(0)
  const outerRef = useRef(null)

  const visibleImages = useMemo(
    () => media.slice(firstRow * columns, firstRow * columns + visibleCells),
    [firstRow, columns, visibleCells, libraryLastUpdate]
  )

  const selectMultiple = Boolean(keys.Shift) && lastSelected !== -1
  const selectStart = selectMultiple ? Math.min(hovered, lastSelected) : -1
  const selectEnd = selectMultiple ? Math.max(hovered, lastSelected) : -1

  useEffect(() => {
    const onResize = () => {
      if (!outerRef.current) {
        return
      }

      const rect = outerRef.current.getBoundingClientRect()
      const width = rect.width
      const columns = Math.floor((width - 10) / 160)
      const rows = Math.ceil(media.length / columns)
      const cellHeight = (width - 10) / columns

      setColumns(columns)
      setCellHeight(cellHeight)
      setRows(rows)
    }

    onResize()

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [libraryLastUpdate])

  useEffect(() => {
    const onScroll = () => {
      setFirstRow(Math.max(Math.floor(window.scrollY / cellHeight) - 1, 0) || 0)
      setVisibleCells((Math.ceil(window.innerHeight / cellHeight) + 2) * columns || 0)
    }

    onScroll()

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [cellHeight, columns, window.scrollY, window.innerHeight])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.Control && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        dispatch(selectAll())
      } else if (e.key === 'Escape' && selectedIndex === -1) {
        dispatch(clearSelected())
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const handleSelect = (index, prevSelected) => {
    if (!selectMultiple) {
      dispatch(toggleSelected(index))
      if (prevSelected) {
        setLastSelected(-1)
      } else {
        setLastSelected(index)
      }
    } else {
      dispatch(toggleMultiple(selectStart, selectEnd))
    }
  }

  const handleOpen = (index) => {
    dispatch(setLightboxSelected(index))
  }

  const handleDeleteAlbum = () => {
    window.ipcSend('request-delete-album', {
      id: currentAlbum
    })

    dispatch(clearSelected())
    dispatch(setCurrentAlbum('all'))
  }

  if (media.length === 0 && currentAlbum !== 'all') {
    return (
      <Centered>
        <Typography>
          This album is empty
        </Typography>
        <Button onClick={handleDeleteAlbum}>Delete album</Button>
      </Centered>
    )
  }

  return (
    <Container ref={outerRef} height={cellHeight * rows}>
      <Grid offset={firstRow * cellHeight}>
        {visibleImages.map((image) => (
          <Thumbnail
            key={image.thumbPath}
            src={image.thumbPath}
            isVideo={image.mediaType === 'video'}
            onSelect={() => handleSelect(image.index, image.isSelected)}
            onMouseEnter={() => setHover(image.index)}
            isSelected={image.isSelected}
            isHovered={(
              selectStart <= image.index &&
              selectEnd >= image.index
            )}
            onClick={() => handleOpen(image.index)}
          />
        ))}
      </Grid>
    </Container>
  )
}

export default Gallery
