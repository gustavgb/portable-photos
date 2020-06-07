import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import Button from '../Blocks/Button'
import { clearSelected } from '../actions'
import Modal from './Modal'
import ListItem from './ListItem'

const Collapse = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  height: ${props => props.open ? `${props.theme.mixins.selectionBar.height}px` : '0'};
  overflow: hidden;
  transition: all .2s ease-out;
`

const Container = styled.div`
  padding: 0 1.8rem;
  background-color: ${props => props.theme.palette.common.white};
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
`

const Title = styled.span`
  font-size: ${props => props.theme.fontSize.body};
  margin-left: 1rem;
`

const Spacer = styled.span`
  flex: 1 0 auto;
`

const Dialog = styled.div`
  width: 40rem;
  margin: 10vh auto 0;
  max-height: 80vh;
  background-color: ${props => props.theme.palette.common.white};
  border-radius: 4px;
  padding: 1rem;
`

const DialogTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.body};
  padding: 1rem 1rem 2rem;
  border-bottom: 1px solid #ddd;
  margin: 0 0 1rem;
`

const Search = styled.input`
  padding: 1rem;
  width: 100%;
  font-size: ${props => props.theme.fontSize.small};
  border: 1px solid #ddd;
  border-radius: 4px;
`

const Selection = () => {
  const dispatch = useDispatch()
  const albums = useSelector(state => state.library.albums)
  const currentAlbum = useSelector(state => state.library.currentAlbum)
  const album = albums.find(album => album.id === currentAlbum) || {}
  const media = album.media || []
  const libraryLastUpdate = useSelector(state => state.library.lastUpdate)
  const numSelected = useMemo(() => media.filter(media => media.isSelected).length, [libraryLastUpdate])
  const [showAlbums, setShowAlbums] = useState(false)
  const [search, setSearch] = useState('')

  const handleCancel = () => {
    dispatch(clearSelected())
  }

  const handleCreate = () => {
    window.ipcSend('request-new-album', {
      name: search,
      items: media.filter(media => media.isSelected).map(media => media.originalPath)
    })

    setShowAlbums(false)
    dispatch(clearSelected())
  }

  const handleAddTo = (id) => {
    const nextMedia = albums
      .find(album => album.id === id).media
      .concat(media.filter(media => media.isSelected))
      .map(media => media.originalPath)

    window.ipcSend('request-update-album', {
      id,
      items: Array.from(new Set(nextMedia))
    })

    setShowAlbums(false)
    dispatch(clearSelected())
  }

  const handleRemove = () => {
    window.ipcSend('request-update-album', {
      id: currentAlbum,
      items: media.filter(media => !media.isSelected).map(media => media.originalPath)
    })

    setShowAlbums(false)
    dispatch(clearSelected())
  }

  return (
    <>
      <Modal open={showAlbums} onClose={() => setShowAlbums(false)} unmount>
        <Dialog>
          <DialogTitle>Add to album</DialogTitle>
          <Search
            placeholder='Search albums'
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search.length > 0 && (
            <ListItem onClick={handleCreate}>
              Create album: <strong>{search}</strong>
            </ListItem>
          )}
          {albums.filter(album => album.id !== 'all').map(album => (
            <ListItem
              key={album.id}
              onClick={() => handleAddTo(album.id)}
            >
              {album.name}
            </ListItem>
          ))}
        </Dialog>
      </Modal>
      <Collapse open={numSelected > 0}>
        <Container>
          <Button onClick={handleCancel}>Cancel</Button>
          <Title>
            {numSelected} items selected
          </Title>
          <Spacer />
          <Button onClick={() => setShowAlbums(true)}>Add to album</Button>
          {currentAlbum !== 'all' && (
            <Button onClick={handleRemove}>Remove from album</Button>
          )}
        </Container>
      </Collapse>
    </>
  )
}

export default Selection
